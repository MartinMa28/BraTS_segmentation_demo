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
            <div class="btn-group" role="group" aria-label="operations-group">
                <button class="btn btn-light btn-sm inference" data-case-name="${newCase.case_id}" data-id="${newCase.id}">
                    Predict
                    <span class="spinner-border spinner-border-sm" role="status" style="visibility: hidden;" id="${newCase.id}-inference-spinner"></span>
                </button>
                <button class="btn btn-light btn-sm view3D" data-case-name="${newCase.case_id}" data-id="${newCase.id}">
                    View
                    <span class="spinner-border spinner-border-sm" role="status" style="visibility: hidden;" id="${newCase.id}-view-spinner"></span>
                </button>
                <button class="btn btn-light btn-sm delete_case" data-case-name="${newCase.case_id}" data-id="${newCase.id}">
                    Delete
                    <span class="spinner-border spinner-border-sm" role="status" style="visibility: hidden;" id="${newCase.id}-delete-spinner"></span>
                </button>
            </div>
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


// event delegation for button.inference
document.querySelector('tbody').addEventListener('click', (e) => {
    if (e.target && e.target.matches('button.inference')) {
        let spinner = document.getElementById(`${e.target.dataset.id}-inference-spinner`);
        spinner.style.visibility = 'visible';
        let requestURL = 'http://' + (HOSTNAME_URL + RESTfulAPI_URLS.inference).replace(999, e.target.dataset.caseName);
        console.log(requestURL);
        fetch(requestURL)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                spinner.style.visibility = 'hidden';
            })
            .catch((err) => {alert(err);});
    }
});


// event delegation for button.delete_case
document.querySelector('tbody').addEventListener('click', (e) => {
    if (e.target && e.target.matches('button.delete_case')) {
        let spinner = document.getElementById(`${e.target.dataset.id}-delete-spinner`);
        spinner.style.visibility = 'visible';
        console.log((HOSTNAME_URL + RESTfulAPI_URLS.delete_case).replace(999, e.target.dataset.id));

        fetch(('http://' + HOSTNAME_URL + RESTfulAPI_URLS.delete_case).replace(999, e.target.dataset.id))
        .then(() => {
            let requestURL = 'http://' + HOSTNAME_URL + RESTfulAPI_URLS.get_cases;
            fetch(requestURL)
                .then(res => res.json())
                .then(data => {
                    spinner.style.visibility = 'hidden';
                    updateCaseList(data);
                })
                .catch(err => {alert(err);});
        })
        .catch(err => {alert(err)});
    }
});


// event delegation for button.view3D
document.querySelector('tbody').addEventListener('click', (e) => {
    if (e.target && e.target.matches('button.view3D')) {
        let spinner = document.getElementById(`${e.target.dataset.id}-view-spinner`);
        spinner.style.visibility = 'visible';
        let requestURL = 'http://' + (HOSTNAME_URL + RESTfulAPI_URLS.labels).replace(999, e.target.dataset.caseName);
        console.log(requestURL);
        fetch(requestURL)
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
                    width: "550px",
                    height: "450px",
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 0
                    }
                };

                
                let prevPlot = document.querySelector('#viewer_container div.plot-container.plotly');
                if (prevPlot !== null) {
                    // delete previous 3 traces
                    Plotly.deleteTraces('viewer_container', [0, 1, 2]);
                    // add newly created traces
                    Plotly.addTraces('view_container', scatterData);
                }

                Plotly.newPlot('viewer_container', scatterData, layout);
                
                spinner.style.visibility = 'hidden';
            })
            .catch((err) => {
                alert(err);
            });
    }
});