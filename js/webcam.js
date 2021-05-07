const video = document.getElementById('video')
var track;
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.ageGenderNet.loadFromUri('./models')
])

openVideo.addEventListener('click', () => {
    navigator.getUserMedia({ video: {} },
        stream => {
            video.srcObject = stream
            track = stream.getTracks()[0]
        },
        err => alert(err)
    )
})

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        // faceapi.draw.drawDetections(canvas, resizedDetections)
        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

        if (detections.length != 0) {
            if (detections.length >= 1) {
                //console.log(detections)
                canvas.getContext('2d').drawImage(video, 0, 0);
                const imageWeb = document.getElementById('image-contain')
                var img = document.createElement('img');
                img.src = canvas.toDataURL();
                imageWeb.append(img);
                console.log(img.src);
                img.style.zIndex = 1000;
            } else
                throw new Error("Only one face was accepted")
            video.srcObject.active = false;
            video.remove();
            track.stop();
        } else {
            video.srcObject.active = false;
            video.remove();
            track.stop();
            console.log("Don't have any face. Please open webcam again");
        }
    }, 1000)
})