document.querySelectorAll('button.inference').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("inference " + btn.dataset.caseName);
    });
});

document.querySelectorAll('button.view3D').forEach((btn) => {
    btn.addEventListener('click', () => {
        console.log("3D view " + btn.dataset.caseName);
    });
});