document.querySelectorAll('button.inference').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("inference " + btn.dataset.caseName);
        fetch(`http://10.253.218.12:8000/inference/${btn.dataset.caseName}`)
            .then((res) => {
                console.log(res.json());
                btn.textContent = "Predict";
            })
            .catch((err) => {alert(err);});
        
        btn.textContent = "Predicting ..."
    });
});

document.querySelectorAll('button.view3D').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("3D view " + btn.dataset.caseName);
        fetch(`http://10.253.218.12:8000/labels/${btn.dataset.caseName}`)
            .then((res) => {
                console.log(`length: ${res.json().length}`);
                btn.textContent = 'View';
            })
            .catch((err) => {
                alert(err);
            });
        
        btn.textContent = 'Plotting...';
    });
});