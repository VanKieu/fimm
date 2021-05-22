var arraySimilarity = new Array();
var arrayImage = new Array();

//Exact face from image
async function extractFaceFromBox(image, faceapi, faceMatcher) {
    var newcanvas = faceapi.createCanvasFromMedia(image);

    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(newcanvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors().withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    let arrayImageName = new Array();
    resizedDetections.map(d => {
        let findBestMatch = faceMatcher.findBestMatch(d.descriptor);
        arrayImageName.push(findBestMatch._label);
    })

    for (let i = 0; i < resizedDetections.length; i++) {
        //let findBestMatch = faceMatcher.findBestMatch(resizedDetections.descriptor);
        //console.log(findBestMatch);
        const box = resizedDetections[i].detection.box;
        const regionsToExtract = [
            new faceapi.Rect(box.x - 60, box.y - 50, box.width + 120, box.height + 120)
        ]

        let faceImages = await faceapi.extractFaces(image, regionsToExtract);
        let newimg = document.createElement('img');

        if (faceImages.length == 0) {
            console.log('Face not found');
        } else {
            faceImages.forEach(newcanvas => {
                if (arrayImageName[i] != 'unknown') {
                    newimg.src = newcanvas.toDataURL();
                    arrayImage.push(new Image(arrayImageName[i], newimg.src));
                }
            })
        }
    }
}

//Cut image from video automtionally
async function cutImageFromVideo(canvas, img, displaySize, video) {

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    if (detections.length != 0) {
        if (detections.length >= 1) {
            canvas.getContext('2d').drawImage(video, 0, 0);
            img.src = canvas.toDataURL();
        } else
            console.log("Only one face was accepted");
        video.srcObject.active = false;
        video.remove();
        track.stop();
    } else {
        video.srcObject.active = false;
        video.remove();
        track.stop();
        console.log("Don't have any face. Please open webcam again");
    }
    return img;
}

// Calculate matching ratio between faces
function CalculateEuclidean(descriptor, descriptions, faceapi) {
    try {
        //Decriptors of 51 people
        const description = descriptions.labeledDescriptors;
        //calculate the similarity ratio between best match and 51 faces

        try {
            let temp = [];
            var euclideanDistance = 0;
            var avarage = 0;
            for (let i = 0; i < description.length; i++) {
                var sum = 0;

                for (let j = 0; j < description[i].descriptors.length; j++) {
                    euclideanDistance = faceapi.euclideanDistance(descriptor.descriptor, description[i].descriptors[j]);
                    sum += euclideanDistance;
                }

                avarage = ((1 - (sum / (description[i].descriptors.length))) * 100).toFixed(1);

                //Just add data to object when has distance from 0 -> 0.6
                if (avarage >= 40.0) {
                    let url = "/labeled_images/" + descriptions.labeledDescriptors[i].label + "/1.jpg";
                    temp.push(new Identity(description[i].label, avarage, url));
                }
            }

            let result = temp.sort((a, b) => b.ratio - a.ratio).slice(1, 5);

            return result;
            //arraySimilarity.sort((a, b) => parseFloat(a.avarage) - parseFloat(b.avarage));
        } catch (error) {
            console.log("Can not found the face of this image");
        }
        //return getSimilarity(descriptions);
    } catch (error) {
        console.log("Error Calculate Euclidean " + error);
    }
}


// Create JSON converted data to LabeledFaceDescriptors and Create Face Matcher

async function createFaceMatcher(data, faceapi) {
    try {
        const labeledFaceDescriptors = await Promise.all(data.map(className => {
            const descriptors = [];
            for (var i = 0; i < className._descriptors.length; i++) {
                descriptors.push(className._descriptors[i]);
            }
            return new faceapi.LabeledFaceDescriptors(className._label, descriptors);
        }));
        return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    } catch (error) {
        console.log("Error create Face Matcher " + error);
    }
}

async function recognition(image, canvas, faceMatcher, faceapi) {
    try {
        canvas = faceapi.createCanvasFromMedia(image);

        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi.detectAllFaces(image)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // find the best identity of the detected face
        var index = 0;
        const results = resizedDetections.map(d => {

            let findBestMatch = faceMatcher.findBestMatch(d.descriptor);
            let calculateEuclidean = CalculateEuclidean(d, faceMatcher, faceapi);

            if (typeof calculateEuclidean !== 'undefined' && calculateEuclidean.length > 0) {
                arraySimilarity[index] = new BestIdentity(findBestMatch.label, ((1 - findBestMatch.distance) * 100).toFixed(1), d.age.toFixed(0), d.gender);
                arraySimilarity[index][0] = calculateEuclidean;
                index++;
            }
        })

        setArraySimilarity(arraySimilarity);

    } catch (error) {
        console.log("Error recognition " + error);
    }
}

function getArraySimilarity() {
    return this.arraySimilarity;
}

function setArraySimilarity(arr) {
    this.arraySimilarity = arr;
}

function getImage() {
    return this.arrayImage;
}

function setImage(arr) {
    this.arrayImage = arr;
}