<script>
    import Papa from "papaparse";
    import * as tf from "@tensorflow/tfjs";
    import { onMount } from "svelte";
    import { baseUrl } from "./config.js";
    import jQuery from "jquery";
    import { lbdurl } from "./config.js";
    import { useLazyImage as lazyImage } from "svelte-lazy-image";

    let { username: propUsername } = $props();
    let loading = $state(true);
    let message = $state("");
    let data = $state({});
    let loadingMsg = $state("This operation takes some time, please wait...");

    const csvUrl = `${window.location.origin}/ratings_5000_250k.csv`;
    const n_rec = 60;
    const n_batch = 1024;
    const n_epoch = 4;

    async function handleImageLoad() {
        jQuery(event.target).parent().addClass("imgok");
    }

    async function handleImageError() {
        jQuery(event.target).parent().removeClass("imgok").addClass("notok");
        jQuery(event.target).attr("src", "images/poster.jpg");
    }

    function getValues(arr) {
        try {
            return arr.values();
        } catch {}
        return [];
    }

    function replaceDash(str) {
        try {
            return str.replace("-", " ");
        } catch {
            return "";
        }
    }

    function replaceSize(src, height = 165, width = 110) {
        try {
            if (src !== null) {
                if (src.includes("a.ltrbxd")) {
                    try {
                        return (
                            src.split("-0-").slice(0, 2).join("-0-") +
                            "-0-" +
                            width +
                            "-0-" +
                            height +
                            "-crop.jpg"
                        );
                    } catch (error) {
                        if (src.includes(".jpg")) {
                            return src;
                        } else {
                            return src + ".jpg";
                        }
                    }
                }
                return (
                    "//a.ltrbxd.com/resized/" +
                    src +
                    "-0-" +
                    width +
                    "-0-" +
                    height +
                    "-crop.jpg"
                );
            }
        } catch {}
        return "";
    }

    async function loadCsvData() {
        return new Promise((resolve, reject) => {
            Papa.parse(csvUrl, {
                download: true,
                header: true,
                worker: true,
                complete: function (results) {
                    resolve(results.data);
                },
                error: function (error) {
                    reject(error);
                },
            });
        });
    }

    async function loadUserData(username) {
        let data = localStorage.getItem(username.toLowerCase());
        if (data === null || data === "undefined") return null;
        data = JSON.parse(data);
        return data.watched
            .map((item) => ({
                user: "500",
                movie: item._id,
                r: item.r * 2,
                //r: Math.floor(Math.random() * 10) + 1
            }))
            .filter((item) => item.r > 0);
    }

    async function getRecommendations(user, data) {
        const validRatings = user.filter((rating) =>
            data.some((d) => d.movie === rating.movie),
        );
        validRatings.forEach((rating) => data.push(rating));
        const users = [...new Set(data.map((d) => d.user))];
        const movies = [...new Set(data.map((d) => d.movie))];
        const userMap = Object.fromEntries(users.map((u, i) => [u, i]));
        const movieMap = Object.fromEntries(movies.map((m, i) => [m, i]));
        const userIndices = data.map((d) => userMap[d.user]);
        const movieIndices = data.map((d) => movieMap[d.movie]);

        loadingMsg = "Data normalization";

        let ratings = data.map((d) => parseFloat(d.r)).filter((r) => !isNaN(r));
        ratings = ratings.map((r) => (r - 1) / 9);
        const minLength = Math.min(
            userIndices.length,
            movieIndices.length,
            ratings.length,
        );
        userIndices.length = movieIndices.length = ratings.length = minLength;

        loadingMsg = "Tensorflow model preparation";
        console.log("Prepared data for TensorFlow.js:", {
            userIndices,
            movieIndices,
            ratings,
        });

        const userInput = tf.input({ shape: [1] });
        const movieInput = tf.input({ shape: [1] });
        const userEmbedding = tf.layers
            .embedding({
                inputDim: users.length,
                outputDim: 25,
                //embeddingsRegularizer: tf.regularizers.l2({ l2: 0.001 })
            })
            .apply(userInput);
        const movieEmbedding = tf.layers
            .embedding({
                inputDim: movies.length,
                outputDim: 25,
                //embeddingsRegularizer: tf.regularizers.l2({ l2: 0.001 })
            })
            .apply(movieInput);
        const userVector = tf.layers.flatten().apply(userEmbedding);
        const movieVector = tf.layers.flatten().apply(movieEmbedding);
        const dotProduct = tf.layers
            .dot({ axes: 1 })
            .apply([userVector, movieVector]);
        const model = tf.model({
            inputs: [userInput, movieInput],
            outputs: dotProduct,
        });
        model.compile({ optimizer: "adam", loss: "meanSquaredError" });

        loadingMsg = `Model created and compiled, start 1/${n_epoch} epoch`;
        console.log("Model created and compiled.");

        let loss = "";

        await model.fit(
            [
                tf.tensor2d(userIndices, [userIndices.length, 1]),
                tf.tensor2d(movieIndices, [movieIndices.length, 1]),
            ],
            tf.tensor2d(ratings, [ratings.length, 1]),
            {
                epochs: n_epoch,
                batchSize: n_batch,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        loadingMsg = `Epoch ${epoch + 1}/${n_epoch} completed. Loss: ${logs.loss.toFixed(3)}`;
                        console.log(
                            `Epoch ${epoch + 1}/${n_epoch} completed. Loss: ${logs.loss}`,
                        );
                        loss = logs.loss.toFixed(3);
                    },
                },
            },
        );
        loadingMsg = "Model training completed with Loss: " + loss;
        console.log("Model training completed.");

        const userIdx = userMap["500"];
        const unratedMovieIndices = movies
            .map((m, i) => ({
                m,
                i,
            }))
            .filter((movie) => !validRatings.some((r) => r.movie === movie.m))
            .map((movie) => movie.i);

        const predictions = await Promise.all(
            unratedMovieIndices.map(async (movieIdx) => {
                const pred = await model
                    .predict([
                        tf.tensor2d([userIdx], [1, 1]),
                        tf.tensor2d([movieIdx], [1, 1]),
                    ])
                    .data();
                return { _id: movies[movieIdx], score: pred[0] };
            }),
        );

        const maxScore = Math.max(...predictions.map((p) => p.score));
        const minScore = Math.min(...predictions.map((p) => p.score));

        predictions.forEach((p) => {
            p.score = (p.score - minScore) / (maxScore - minScore);
        });

        return predictions.sort((a, b) => b.score - a.score).slice(0, n_rec);
    }

    onMount(async () => {
        let username;
        username = localStorage.getItem("latest");
        if (username === null || username === "undefined") {
            message = "Incorrect or not set data";
        } else {
            data = localStorage.getItem(username.toLowerCase() + "_rec");
            data = JSON.parse(data);
            if (data === null || data === "undefined") {
                loadingMsg = "Download database and user ratings";
                const [user, ratings] = await Promise.all([
                    loadUserData(username),
                    loadCsvData(),
                ]);
                if (
                    user === null ||
                    ratings === null ||
                    user === "undefined" ||
                    ratings === "undefined"
                ) {
                    message = "Incorrect or not set data";
                } else {
                    let rec;
                    try {
                        rec = await getRecommendations(user, ratings);
                    } catch (error) {
                        console.error("Error during model training:", error);
                        loadingMsg = "Error during model training: " + error;
                    }
                    loadingMsg = "Get information about recommended films";
                    try {
                        const resp = await fetch(baseUrl + "associate", {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json;charset=UTF-8",
                            },
                            body: JSON.stringify(rec),
                        });
                        data = await resp.json();
                        localStorage.setItem(
                            username.toLowerCase() + "_rec",
                            JSON.stringify(data),
                        );
                    } catch {
                        message = "Server error.";
                    }
                }
            }
        }

        loading = false;
    });
</script>

<main>
    {#if loading}
        <div class="loaderContainer2 withMsg">
            <div class="loadingMsg">{loadingMsg}</div>
            <div class="loader2"></div>
        </div>
    {/if}

    {#if message !== ""}
        <p class="errormsg message">{@html message}</p>
    {:else}
        <section class="sectionStats">
            <div class="sepline">
                <span>Recommended movies</span>
                <div class="line"></div>
            </div>
            <div class="">
                <div class="filmList">
                    {#each getValues(data) as element}
                        <div class="singleFilm singleFilmBig">
                            <a
                                class="poster"
                                href="{lbdurl}{data.username}/film/{element._id}"
                            >
                                <div class="containertextimg">
                                    <span>{replaceDash(element._id)}</span>
                                </div>
                                <img
                                    use:lazyImage
                                    onload={handleImageLoad}
                                    onerror={handleImageError}
                                    class="lazy"
                                    src="images/poster.jpg"
                                    data-src={replaceSize(
                                        element.poster,
                                        225,
                                        150,
                                    )}
                                    alt={element._id}
                                />
                            </a>
                            <div class="recpercentage">
                                <img
                                    src="images/orangeheart.jpg"
                                    alt="recommendation score"
                                />
                                <span>{Math.floor(element.score * 100)}%</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </section>
        <div style="height: 5em"></div>
    {/if}
</main>
