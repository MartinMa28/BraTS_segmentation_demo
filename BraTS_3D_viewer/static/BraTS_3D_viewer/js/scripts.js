document.querySelectorAll('button.inference').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("inference " + btn.dataset.caseName);
        fetch(`http://10.253.218.12:8000/inference/${btn.dataset.caseName}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
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
                console.log(`Enhancing tumor length: ${data.et_length}`);
                console.log(`Edema length: ${data.edema_length}`);
                console.log(`Necrotic tumor length: ${data.necrotic_length}`);
                
                let etTrace = {
                    x: data.et_xs,
                    y: data.et_ys,
                    z: data.et_zs,
                    mode: 'markers',
                    marker: {
                        size: 3,
                        color: 'rgb(255, 255, 79)',
                        opacity: 0.8
                    },
                    type: 'scatter3d'
                };

                let edemaTrace = {
                    x: data.edema_xs,
                    y: data.edema_ys,
                    z: data.edema_zs,
                    mode: 'markers',
                    marker: {
                        size: 3,
                        color: 'rgb(0, 153, 153)',
                        opacity: 0.8
                    },
                    type: 'scatter3d'
                };

                let necroticTrace = {
                    x: data.necrotic_xs,
                    y: data.necrotic_ys,
                    z: data.necrotic_zs,
                    mode: 'markers',
                    marker: {
                        size: 3,
                        color: 'rgb(104, 47, 162)',
                        opacity: 0.8
                    },
                    type: 'scatter3d'
                };

                let scatterData = [etTrace, edemaTrace, necroticTrace];
                
                let layout = {
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 0
                    }
                };

                Plotly.newPlot('viewer_container', scatterData, layout);
                
                btn.textContent = 'View';
            })
            .catch((err) => {
                alert(err);
            });
        
        btn.textContent = 'Plotting...';
    });
});