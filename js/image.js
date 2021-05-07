const imageUpload = document.getElementById('imageUpload')
const divLoading = document.getElementById('loading');
const outPutImg = document.getElementById('output_image');
const peInfo = document.getElementById('pe_info');
// Load face-api model
var t1 = performance.now()
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(start)

async function start() {
  // Create <div> to show image after choose new Img
  const container = document.getElementById('image-contain')
  container.style.position = 'relative'
  // document.body.append(container)

  // Load json to backend
  const content = await faceapi.fetchJson('../js/labeledDescriptors.json')
  //console.log('content', content)

  //Load image from dataset

  //const labeledFaceDescriptors = await loadLabeledImages();
  //var t2 = now.performance();
  //console.log('loaded - ', t2-t1);
  //console.log(JSON.stringify(labeledFaceDescriptors));

  // Load data from JSON and convert to Float32Array to use face-api
  for (var x = 0; x < content.length; x++) {
    for (var y = 0; y < content[x]._descriptors.length; y++) {
      var results = Object.values(content[x]._descriptors[y]);
      content[x]._descriptors[y] = new Float32Array(results);
    }
  }
  const faceMatcher = await createFaceMatcher(content);
  var t2 = performance.now()
  console.log('Time Model and Image Loaded - ', (t2 - t1) / 1000, 'second')
  //console.log(faceMatcher);
  //const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  // Đối tượng ảnh khi người dùng chọn ảnh đưa vào hoặc ảnh được cắt từ Webcam
  let image
  // Canvas là khung màu xanh bao quanh khuon mặt nha KIỀU
  let canvas

  //Get image from HTML form and start find identity of the face
  // MOST IMPORTANCE FUNC
  imageUpload.addEventListener('change', async () => {
    divLoading.style.display = 'block';
    outPutImg.disabled = true;
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)

    // Calculate the matching percentage of the main face and all face in dataset
    await CalculateEuclidean(image, faceMatcher);

    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)

    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender()

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //console.log(resizedDetections)

    // find the best identity of the detected face
    const results = resizedDetections.map(d =>
      faceMatcher.findBestMatch(d.descriptor)
    )

    //draw canva to all detected face
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
    divLoading.style.display = 'none';

    outPutImg.disabled = true;
    // window.setTimeout(outPutImg, 500)
    if (outPutImg) {
      setTimeout(OutImage, 1000);
    }


  })
  function OutImage() {
    peInfo.style.display = '';
    document.getElementById('home').style.display = "none";
  }
}

// Calculate matching ratio between faces
async function CalculateEuclidean(img, descriptions) {
  const descriptorImg = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender()
  //console.log('descriptorImg', descriptorImg);
  const description = descriptions.labeledDescriptors;
  //console.log('length', description[0].descriptors[0]);
  try {
    var euclideanDistance = 0
    var avarage = 0
    for (let i = 0; i < description.length; i++) {
      var sum = 0
      for (let j = 0; j < description[i].descriptors.length; j++) {
        euclideanDistance = faceapi.euclideanDistance(descriptorImg[0].descriptor, description[i].descriptors[j])
        sum += euclideanDistance
      }
      avarage = sum / (description[i].descriptors.length)
      //console.log('avg: ', avarage)
      euclideanDistance = { "euclideanDistance": avarage }
      Object.assign(description[i], euclideanDistance)
    }
  } catch (error) {
    console.log("Can not found the face of this image")
  }
  //console.log('test',descriptions)
  console.log('get name:', getName(descriptions))
  return getName(descriptions);
}

// Get people's name who has the highest similarity ratio
function getName(descriptions) {
  var result = new Array()
  for (let i in descriptions.labeledDescriptors) {
    if (descriptions.labeledDescriptors[i].euclideanDistance <= 0.6) {
      // result.push( descriptions.labeledDescriptors[i].label, descriptions.labeledDescriptors[i].euclideanDistance )
      result.push({ "name": descriptions.labeledDescriptors[i].label, "ratio": ((1 - descriptions.labeledDescriptors[i].euclideanDistance) * 100).toFixed(2) })
      //descriptions.labeledDescriptors[i].label, descriptions.labeledDescriptors[i].euclideanDistance )
    }
  }
  result.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio));
  var arr = new Array();

  if (result.length < 7)
    arr = result;
  else {
    for (let i = 0; i < (result.length) / 2; i++)
      arr.push(result[i]);
  }
  return arr;
}

// Create JSON converted data to LabeledFaceDescriptors and Create Face Matcher
async function createFaceMatcher(data) {
  const labeledFaceDescriptors = await Promise.all(data.map(className => {
    const descriptors = [];
    for (var i = 0; i < className._descriptors.length; i++) {
      descriptors.push(className._descriptors[i]);
    }
    return new faceapi.LabeledFaceDescriptors(className._label, descriptors);
  }))
  return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

// Loading data from dataset for first time
// async function loadLabeledImages() {
//   //const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Charlie Puth', 'Justin Bieber', 'Selena Gomez', 'Ariana Grande']
//   const labels = [
//     'Bùi Thị Nga',            'Bảo Ngân',              'Cao Nguyên',
//   'Hoàng Gia Bảo Hân',      'Huyền Trang',           'Huỳnh Thị Nhật Hạ',     
//   'Huỳnh Thị Quý Thương',   'Hằng Mai',              'Hồ Vân Anh',
//   'Lê Ngọc Hoàng Huy',      'Lê Thị Thanh Ngân',     'Lê Trung Kiên',
//   'Lê Văn Phóng',           'Lê ĐÌnh Quốc Dũng',     'Minh Hằng',
//   'Nguyễn Anh Tú',          'Nguyễn Gia Như',        'Nguyễn Huỳnh Hải Triều',
//   'Nguyễn Hồ Diễm Uyên',    'Nguyễn Hữu Thiện',      'Nguyễn Hữu Thịnh',      
//   'Nguyễn Hữu Tường',       'Nguyễn Minh Huy',       'Nguyễn Thị Anh Đào',    
//   'Nguyễn Thị Bích Ni',     'Nguyễn Thị Phương Mai', 'Nguyễn Thị Thu Hiền',   
//   'Nguyễn Văn Minh Tới',    'Nguyễn Đức Mận',        'Ngô Ngọc Mỹ',
//   'Ngô Trùng Dương',        'Ngọc Hân',              'Như Quỳnh',
//   'Phan Thùy Ngân',         'Phương Thơm',           'Phạm Hoàng Nam',        
//   'Phạm Hà Vi',             'Phạm Trung Hiếu',       'Phạm Văn Tín',
//   'Quang Huy( Jack Wave )', 'Quang Huy(Jin)',        'Thanh Thương',
//   'Thảo Trang',             'Trần Thị Oanh',         'Trần Thị Thùy Trân',
//   'Trần Đình Quang Trọng',  'Trần Đình Thiện',       'Trần Đức Công Thành',
//   'Tô Trường Hân',          'Đinh Thị Vân Kiều',     'Đặng Thị Hồng Thắm'
//   ]
//   return Promise.all(
//     labels.map(async label => {
//       const descriptions = []
//       for (let i = 1; i <= 5; i++) {
//         const img = await faceapi.fetchImage(`/labeled_images2/${label}/${i}.jpg`)
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor().withFaceExpressions().withAgeAndGender()
//         descriptions.push(detections.descriptor)
//       }
//       return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     })
//   )
// }

