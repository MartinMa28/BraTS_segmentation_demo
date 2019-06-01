function updateCaseList(data) {
    // remove all of rows under the tbody
    tBody = document.querySelector('tbody');
    tRows = document.querySelectorAll('tbody tr');

    tRows.forEach((row) => {
        tBody.removeChild(row);
    });

    // update the tbody with new rows retrieved from the server
    newCases = data.cases;
    
    newCases.forEach((newCase) => {
        newRow = document.createElement('tr');
        newRow.innerHTML = `
        <td>${newCase.case_id}</td>
        <td>
            <button class="btn btn-light inference" data-case-name=${newCase.case_id}>Predict</button>
            <button class="btn btn-light view3D" data-case-name=${newCase.case_id}>View</button>
            <button class="btn btn-light delete_case" data-id=${newCase.id}>Delete</button>
        </td>
        `
        tBody.appendChild(newRow);
    })
}

document.querySelector('button#modal-upload-btn').addEventListener('click', () => {
    let formElement = document.querySelector('div.modal-body form');
    let formData = new FormData(formElement);

    let xhr = new XMLHttpRequest();
    
    let progressBar = document.querySelector('div.progress-bar');
    
    let uploadBtn = document.querySelector('button#modal-upload-btn');
    uploadBtn.setAttribute("disabled", "");

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                uploadBtn.removeAttribute('disabled');
                progressBar.setAttribute('aria-valuenow', 0);
                progressBar.style.width = "0%";
                progressBar.textContent = '';
                let requestURL = 'http://' + HOSTNAME_URL + RESTfulAPI_URLS.get_cases;
                fetch(requestURL)
                    .then(res => res.json())
                    .then(data => {
                        updateCaseList(data);
                    })
                    .catch(err => {alert(err);});
            
            } else {
                alert('There was a problem when uploading MRI cases.');
            }
          }
    }
    
    xhr.upload.addEventListener('progress', (progressEvent) => {
        if (progressEvent.lengthComputable) {
            let p = (progressEvent.loaded / progressEvent.total) * 100;
            console.log(p);
            progressBar.setAttribute('aria-valuenow', p.toPrecision(3));
            progressBar.style.width = `${p.toPrecision(3)}%`;
            progressBar.textContent = `${p.toPrecision(3)}%`;
            
        }
    });

    xhr.open('POST', formElement.action);

    xhr.send(formData);
    
});

document.querySelectorAll('button.inference').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("inference " + btn.dataset.caseName);
        let requestURL = (HOSTNAME_URL + RESTfulAPI_URLS.inference).replace(999, btn.dataset.caseName);
        console.log(requestURL);
        fetch('http://' + requestURL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                btn.textContent = 'Predict';
            })
            .catch((err) => {alert(err);});
        
        btn.textContent = "Predicting ...";
    });
});

document.querySelectorAll('button.delete_case').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log(`Delete ${btn.dataset.id}`);
        console.log((HOSTNAME_URL + RESTfulAPI_URLS.delete_case).replace(999, btn.dataset.id));

        fetch(('http://' + HOSTNAME_URL + RESTfulAPI_URLS.delete_case).replace(999, btn.dataset.id))
        .then(() => {location.reload();})
        .catch(err => {alert(err)});
    });
});

document.querySelectorAll('button.view3D').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("3D view " + btn.dataset.caseName);
        let requestURL = (HOSTNAME_URL + RESTfulAPI_URLS.labels).replace(999, btn.dataset.caseName);
        console.log(requestURL);
        fetch('http://' + requestURL)
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