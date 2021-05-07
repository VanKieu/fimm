//Exact face from image
async function extractFaceFromBox(image, faceapi) {
    //try {
    var newcanvas = faceapi.createCanvasFromMedia(image);

    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(newcanvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const box = resizedDetections[0].detection.box;

    const regionsToExtract = [
        new faceapi.Rect(box.x - 60, box.y - 50, box.width + 120, box.height + 120)
    ]

    let faceImages = await faceapi.extractFaces(image, regionsToExtract);
    const newimg = document.createElement('img');

    if (faceImages.length == 0) {
        console.log('Face not found');
    } else {
        faceImages.forEach(newcanvas => {
            newimg.src = newcanvas.toDataURL();
            //const containers = document.createElement('div');
            //containers.style.position = 'relative';
            //document.body.append(containers);
            //containers.append(newimg);
        })
    }
    //console.log('new img', newimg);
    return newimg;
    // } catch (error) {
    //     console.log("Error extract face from box " + error);
    // }
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
async function CalculateEuclidean(img, descriptions, faceapi) {
    try {
        const descriptorImg = await faceapi.detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions()
            .withAgeAndGender();
        const description = descriptions.labeledDescriptors;
        try {
            var euclideanDistance = 0;
            var avarage = 0;
            for (let i = 0; i < description.length; i++) {
                var sum = 0;
                for (let j = 0; j < description[i].descriptors.length; j++) {
                    euclideanDistance = faceapi.euclideanDistance(descriptorImg[0].descriptor, description[i].descriptors[j]);
                    sum += euclideanDistance;
                }
                avarage = sum / (description[i].descriptors.length);
                euclideanDistance = { "euclideanDistance": avarage }
                Object.assign(description[i], euclideanDistance);
            }
        } catch (error) {
            console.log("Can not found the face of this image");
        }
        return getName(descriptions);
    } catch (error) {
        console.log("Error Calculate Euclidean " + error);
    }
}

// Get people's name who has the highest similarity ratio
function getName(descriptions) {
    var result = new Array();
    for (let i in descriptions.labeledDescriptors) {
        if (descriptions.labeledDescriptors[i].euclideanDistance <= 0.6) {
            result.push({
                "name": descriptions.labeledDescriptors[i].label,
                "ratio": ((1 - descriptions.labeledDescriptors[i].euclideanDistance) * 100).toFixed(2),
                "url": "/labeled_images/" + descriptions.labeledDescriptors[i].label + "/1.jpg"
            });
            console.log(descriptions.labeledDescriptors[i].label)
        }
    }
    result.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));
    var arr = new Array();

    if (result.length < 7)
        arr = result;
    else {
        for (let i = 1; i < (result.length) / 2; i++)
            arr.push(result[i]);
    }
    return arr;
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
        // Calculate the matching percentage of the main face and all face in dataset
        const similarResults = await CalculateEuclidean(image, faceMatcher, faceapi);

        canvas = faceapi.createCanvasFromMedia(image);

        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi.detectAllFaces(image)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions()
            .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // find the best identity of the detected face
        const results = resizedDetections.map(d =>
            faceMatcher.findBestMatch(d.descriptor)
        )

        var jsondata = '{"bestMatch" :' + JSON.stringify(results) +
            ', "gender" :' + resizedDetections[0].gender +
            ', "age" :' + resizedDetections[0].age +
            ', "similarity" :' + JSON.stringify(similarResults) +
            '}';
        return (jsondata);
    } catch (error) {
        console.log("Error recognition " + error);
    }

}