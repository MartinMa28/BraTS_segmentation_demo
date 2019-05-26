document.querySelectorAll('button.inference').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("inference " + btn.dataset.caseName);
        fetch(`http://10.253.218.12:8000/inference/${btn.dataset.caseName}`)
            .then(res => res.json())
            .then(data => {
                console.log(JSON.stringify(data));
                btn.textContent = 'Predict';
            })
            .catch((err) => {alert(err);});
        
        btn.textContent = "Predicting ...";
    });
});

document.querySelectorAll('button.view3D').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("3D view " + btn.dataset.caseName);
        fetch(`http://10.253.218.12:8000/labels/${btn.dataset.caseName}`)
            .then(res => res.json())
            .then(data => {
                console.log(JSON.stringify(data).length);
                let inferenceLabels = JSON.stringify(data)
                let trace = {
                    x: inferenceLabels.xs,
                    y: inferenceLabels.ys,
                    z: inferenceLabels.zs,
                    mode: 'markers',
                    markers: {
                        size: 3,
                        color: inferenceLabels.colors,
                        colorscale: 'Viridis',
                        opacity: 0.8
                    },
                    type: 'scatter3d'
                };

                let scatterData = [trace];
                
                let layout = {
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 0
                    }
                };

                Plotly.newPlot('3D_viewer_container', scatterData, layout);
                
                btn.textContent = 'View';
            })
            .catch((err) => {
                alert(err);
            });
        
        btn.textContent = 'Plotting...';
    });
});