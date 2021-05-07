const imageUpload = document.getElementById("imageUpload");
const video = document.getElementById("video");
const divLoading = document.getElementById('loading');
const outPutImg = document.getElementById('output_image');
const peInfo = document.getElementById('pe_info');
var track;

let img;
let canvas;
let faceExtracted = "";

// Load face-api model
var t1 = performance.now();
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
    faceapi.nets.ageGenderNet.loadFromUri("./models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
    faceapi.nets.tinyFaceDetector.loadFromUri("./models")
]).then(start);

async function start() {
    //var t1 = performance.now();
    // // Create <div> to show image after choose new Img
    const container = document.getElementById('image-contain')
    container.style.position = 'relative'

    // Load json to backend
    //console.log(img + typeof img);
    const content = await faceapi.fetchJson('../js/labeledDescriptors.json')

    // Load data from JSON and convert to Float32Array to use face-api
    for (var x = 0; x < content.length; x++) {
        for (var y = 0; y < content[x]._descriptors.length; y++) {
            var results = Object.values(content[x]._descriptors[y]);
            content[x]._descriptors[y] = new Float32Array(results);
        }
    }
    // Create JSON converted data to LabeledFaceDescriptors and Create Face Matcher
    const faceMatcher = await createFaceMatcher(content, faceapi);

    //Get image from HTML form and start find identity of the face
    // MOST IMPORTANCE FUNC
    imageUpload.addEventListener("change", async () => {
        // divLoading.style.display = 'block';
        //outPutImg.disabled = true;
        if (imageUpload) {
            setTimeout(divloader, 500);
        }
        // setTimeout(divLoading, 500);
        if (img) img.remove();
        if (canvas) canvas.remove();
        img = await faceapi.bufferToImage(imageUpload.files[0]);
        //container.append(img);

        // cắt mặt
        loadImage(img);
        // xử lý ảnh , lúc chọn ảnh
        new Promise(function (resolve, reject) {
            // gọi xử lý hình ảnh
            return resolve(recognition(img, canvas, faceMatcher, faceapi));
        })
            .then((data) => {
                setTimeout(() => { }, 1000);
                return data;
            })
            .then(function (data) {
                console.log(data);
                container.append(getData());
            })
            .catch(() => console.log("Error in Image upload. Image size too small!"))
            .finally(() => {
                console.log("Done!");
                divLoading.style.display = 'none';
                if (outPutImg) {
                    setTimeout(OutImage, 2000);
                }

            });
        function OutImage() {
            peInfo.style.display = '';
            document.getElementById('home').style.display = "none";
        }
        function divloader() {
            divLoading.style.display = 'block';
        }
    });
    // xử lý ảnh cho video
    video.addEventListener("play", () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        var img = document.createElement("img");

        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        cutImageFromVideo(canvas, img, displaySize, video).then(function (val) {

            loadImage(val);

            new Promise(function (resolve, reject) {
                return resolve(recognition(val, canvas, faceMatcher, faceapi));
            })
                .then((data) => {
                    setTimeout(() => { }, 1000);
                    return data;
                })
                .then(function (data) {
                    console.log(data);
                    container.append(getData());
                })
                .catch(() => console.log("Error in Image extracted from Video. Image quality too bad!"))
                .finally(() => console.log("Done!"));
        })
    });
}

// Open video when clickon button "using webcam"
openVideo.addEventListener('click', () => {
    navigator.getUserMedia({ video: {} },
        stream => {
            video.srcObject = stream
            track = stream.getTracks()[0]
        },
        err => alert(err)
    )
})



async function loadImage(img) {
    new Promise(function (resolve, reject) {
        return resolve(extractFaceFromBox(img, faceapi));
    })
        .then(function (data) {
            console.log("setData loading!");
            setData(data);
            console.log("setData loaded!");
        })
        .catch((err) => console.log('Error in loadImage! ', err))
        .finally(function () { return getData() });
}

function getData() {
    return this.faceExtracted;
}

function setData(data) {
    this.faceExtracted = data;
}