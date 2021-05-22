const imageUpload = document.getElementById("imageUpload");
const video = document.getElementById("video");
const divLoading = document.getElementById('loading');
const outPutImg = document.getElementById('output_image');
const peInfo = document.getElementById('pe_info');

var showBestMatch = document.getElementById('bestMatch');
var track;

var arrayDataFirebase = new Array();

let img;
let canvas;
let faceExtracted = "";

const database = firebase.firestore();
const criminalRecord = database.collection('CriminalRecord');

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
    // Create <div> to show image after choose new Img
    const container = document.getElementById('image-contain')
    container.style.position = 'relative'

    // Load json to backend
    const content = await faceapi.fetchJson('../js/function/handle/labeledDescriptors.json')

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
    imageUpload.addEventListener("change", async () => {
        // divLoading.style.display = 'block';
        //outPutImg.disabled = true;
        if (imageUpload) {
            setTimeout(divloader, 1000);
        }
        if (img) img.remove();
        if (canvas) canvas.remove();
        img = await faceapi.bufferToImage(imageUpload.files[0]);

        // Image processes when choosing image
        new Promise(function (resolve, reject) {
            // Process faces recognition 
            return resolve(recognition(img, canvas, faceMatcher, faceapi));
        })
            .then(function () {
                return extractFaceFromBox(img, faceapi, faceMatcher);
            })
            .then(function (data) {

                var arraySimilarity = getArraySimilarity();
                var arrayURLImage = getImage();

                getDataFirebase(arraySimilarity);

                setTimeout(() => {
                    // console.log(arrayDataFirebase);
                    // console.log(arraySimilarity);

                    for (let i = 0; i < arraySimilarity.length; i++) {
                        let fullnameBestMatch = arraySimilarity[i].name;
                        let ageBestMatch = arraySimilarity[i].age;
                        let genderBestMatch = arraySimilarity[i].gender;
                        let typeCrime = getValueNeed(arrayDataFirebase, fullnameBestMatch, 'typeCrime');
                        let typeWanted = getValueNeed(arrayDataFirebase, fullnameBestMatch, 'typeWanted');
                        let url = getURLImage(arrayURLImage, fullnameBestMatch);
                        tempBestMatch = htmlBestMatch(fullnameBestMatch, ageBestMatch, genderBestMatch, typeCrime, typeWanted, url);
                        let tempSimilarity = '';
                        for (let j = 0; j < arraySimilarity[i][0].length; j++) {
                            let fullname = arraySimilarity[i][0][j].name;
                            let gender = getValueNeed(arrayDataFirebase, fullname, 'sex');
                            let dob = getValueNeed(arrayDataFirebase, fullname, 'placeOfBirth');
                            let typeCrime = getValueNeed(arrayDataFirebase, fullname, 'typeCrime');
                            let nationality = getValueNeed(arrayDataFirebase, fullname, 'nationality');
                            console.log(getValueNeed(arrayDataFirebase, fullname, 'typeCrime'));
                            let url = arraySimilarity[i][0][j].url;
                            let placeOfResidence = getValueNeed(arrayDataFirebase, fullname, 'placeOfResidence');
                            let ratio = arraySimilarity[i][0][j].ratio;
                            let scopeWanted = getValueNeed(arrayDataFirebase, fullname, 'scopeWanted');
                            tempSimilarity += htmlSimilarityWithBestMatch(fullname, gender, dob, typeCrime, nationality, url, placeOfResidence, ratio, scopeWanted);
                        }
                        showBestMatch.innerHTML += tempBestMatch + htmlFramesSimilarity(tempSimilarity);
                    }
                    document.getElementById('footer').style.display = "";
                    peInfo.style.height = '';
                }, 1001)
            })
            .catch((err) => console.log(err, "Error in Image upload. Image size too small!"))
            .finally(() => {
                console.log("Done!");
                divLoading.style.display = 'none';
                document.getElementById('body').style.overflowY = "";
                document.getElementById('footer').style.display = "none";
                peInfo.style.height = '586px';
                if (outPutImg) {
                    setTimeout(OutImage, 0);
                }
            });
    });

    // Capture image in webcam when identify faces
    video.addEventListener("play", () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        var img = document.createElement("img");

        // document.body.append(canvas);
        // console.log(canvas.toDataURL());
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        cutImageFromVideo(canvas, img, displaySize, video).then(function (val) {

            if (val) {
                setTimeout(divloader, 500);
            }
            loadImage(val);

            new Promise(function (resolve, reject) {
                return resolve(recognition(val, canvas, faceMatcher, faceapi));
            })
                .then((data) => {
                    console.log(data);
                    var arraySimilarity = getArraySimilarity();
                    console.log(arraySimilarity);
                    var arrayURLImage = getImage();
                    console.log(getDataFirebase(arraySimilarity));
                    getDataFirebase(arraySimilarity);

                    setTimeout(() => {
                        for (let i = 0; i < arraySimilarity.length; i++) {
                            let fullnameBestMatch = arraySimilarity[i].name;
                            let ageBestMatch = arraySimilarity[i].age;
                            let genderBestMatch = arraySimilarity[i].gender;
                            // let url = getURLImage(arrayURLImage, fullnameBestMatch);
                            let url = canvas.toDataURL();
                            let typeCrime = getValueNeed(arrayDataFirebase, fullnameBestMatch, 'typeCrime');
                            let typeWanted = getValueNeed(arrayDataFirebase, fullnameBestMatch, 'typeWanted');
                            tempBestMatch = htmlBestMatch(fullnameBestMatch, ageBestMatch, genderBestMatch, typeCrime, typeWanted, url);
                            let tempSimilarity = '';
                            for (let j = 0; j < arraySimilarity[i][0].length; j++) {
                                let fullname = arraySimilarity[i][0][j].name;
                                // let url = arraySimilarity[i][0][j].url;
                                let gender = getValueNeed(arrayDataFirebase, fullname, 'sex');
                                let dob = getValueNeed(arrayDataFirebase, fullname, 'placeOfBirth');
                                let typeCrime = getValueNeed(arrayDataFirebase, fullname, 'typeCrime');
                                let nationality = getValueNeed(arrayDataFirebase, fullname, 'nationality');
                                console.log(getValueNeed(arrayDataFirebase, fullname, 'typeCrime'));
                                let url = arraySimilarity[i][0][j].url;
                                let placeOfResidence = getValueNeed(arrayDataFirebase, fullname, 'placeOfResidence');
                                let scopeWanted = getValueNeed(arrayDataFirebase, fullname, 'scopeWanted');
                                let ratio = arraySimilarity[i][0][j].ratio;
                                tempSimilarity += htmlSimilarityWithBestMatch(fullname, gender, dob, typeCrime, nationality, url, placeOfResidence, ratio, scopeWanted);
                            }
                            showBestMatch.innerHTML += tempBestMatch + htmlFramesSimilarity(tempSimilarity);
                        }
                        document.getElementById('footer').style.display = "";
                        peInfo.style.height = '1100px';
                    }, 1001)

                    return data;
                })
                .catch(() => console.log("Error in Image extracted from Video. Image quality too bad!"))
                .finally(() => {
                    console.log("Done!");
                    divLoading.style.display = 'none';
                    document.getElementById('body').style.overflowY = "";
                    document.getElementById('footer').style.display = "none";
                    peInfo.style.height = '586px';
                    if (outPutImg) {
                        setTimeout(OutImage, 500);
                    }
                });
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

function OutImage() {
    peInfo.style.display = '';
    document.getElementById('home').style.display = "none";
}

function divloader() {
    divLoading.style.display = 'block';
    document.getElementById('body').style.overflowY = "hidden";
}

//Cut identified faces from image to show in PE page
async function loadImage(img) {
    new Promise(function (resolve, reject) {
        return resolve(extractFaceFromBox(img, faceapi));
    })
        .then(function (data) {
            setData(data);
        })
        .catch((err) => console.log('Error in loadImage! ', err))
        .finally(function () { return getData() });
}

//Get URL of Image which match with the need name
function getURLImage(array, name) {
    for (let i = 0; i < array.length; i++)
        if (name == array[i].name)
            return array[i].url;
    // console.log(array[i].url);
}

//Get all of data from Firebase
function queryData(name) {
    criminalRecord.where("fullname", "==", name).get().then(querySnapshot => {
        let resourcePromise = querySnapshot.docs.map(doc => {
            var promises = [];
            let documentData = doc.data();
            documentData['id'] = doc.id;
            promises.push(criminalRecord.doc(documentData.id).collection('Guilty').get()
                .then(snapshot => {
                    documentData['guilty'] = snapshot.docs.map(doc => {
                        return doc.data();
                    })
                })
            );
            return Promise.all(promises).then(function () {
                return documentData;
            })
        });

        Promise.all(resourcePromise).then(function (allResources) {
            arrayDataFirebase.push(allResources);
        })
            .catch((err) => console.log(err))
    })
}

//Add data from Firebase into array
function getDataFirebase(array) {
    for (let i = 0; i < array.length; i++) {
        queryData(arraySimilarity[i].name);
        for (let j = 0; j < array[i][0].length; j++) {
            queryData(array[i][0][j].name);
            // console.log(array[i][0]);
        }

    }
}

//Get value of variable in an array
function getValueNeed(array, nameSimilarity, variable) {
    let check = ['crime', 'decisionMakingUnit', 'regulationsWanted', 'scopeWanted', 'typeCrime', 'typeWanted'];
    for (let i = 0; i < array.length; i++)
        if (typeof array[i] !== 'undefined' && array[i].length > 0)
            if (array[i][0].fullname == nameSimilarity)
                if (check.includes(variable))
                    return array[i][0].guilty[0][variable];
                else
                    return array[i][0][variable];
}

// // Defining function to get unique values from an array
// function getUnique(array) {
//     var uniqueArray = [];
//     // Loop through array values
//     for (i = 0; i < array.length; i++) {
//         if (typeof array[i] !== 'undefined' && array[i].length > 0)
//             if (uniqueArray.indexOf(array[i][0].fullname) === -1) {
//                 uniqueArray.push(array[i]);
//             }
//     }
//     return uniqueArray;
// }

function getData() {
    return this.faceExtracted;
}

function setData(data) {
    this.faceExtracted = data;
}