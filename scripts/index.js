const video = document.getElementById('video')


// Buscando dispositivos de video
const startVideo = () => {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

// // Carregando images
// const loadLabels = () => {
//     const labels = ['Gabriel Castro']
//     return Promise.all(labels.map(async label => {
//         const descriptions = []
//         for(let i = 1; i <= 5; i++) {
//             const img = await faceapi.fetchImage(`../images/${label}/${i}.png`)

//             const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        
//             descriptions.push(detections.descriptor)
//         }
//         //Objeto que a faceAPI estara utilizando
//         return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     }))
// }

// Importar modelos de redes neurais
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./lib/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./lib/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./lib/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./lib/models'),
    faceapi.nets.ageGenderNet.loadFromUri('./lib/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./lib/models')
]).then(startVideo)

// Adicionar funcionalidades
video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.appendChild(canvas)
    const displaySize = {width: video.width, height: video.height}
    // const labels = await loadLabels()
    faceapi.matchDimensions(canvas, displaySize) 

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            video, 
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        // .withFaceDescriptors()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // Para detectar face
        // const faceMatcher = new faceapi.FaceMatcher(labels, 0.6)
        // const results = resizedDetections.map(d => {
        //     faceMatcher.findBestMatch(d.descriptor)
        // })

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        
        //AgeAndGender
        resizedDetections.forEach(detection => {
            const { age, gender, genderProbability} = detection
            new faceapi.draw.DrawTextField([
                    `${parseInt(age)} years`,
                    `${gender} (${parseInt(genderProbability * 100, 10)}%)`
            ], detection.detection.box.topRight).draw(canvas)
        })

        // results.forEach((result, index) => {
        //     const box = resizedDetections[index].detection.box
        //     const { label, distance } = result
            
        //     new faceapi.draw.DrawTextField([
        //         `${label} (${parseInt(distance * 100, 10)}%)`
        //     ], box.bottomRight).draw(canvas)
        // })
    }, 100)


})