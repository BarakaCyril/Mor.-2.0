document.addEventListener('DOMContentLoaded',  ()=>{

    const photoInput = document.getElementById('uploadPhotos');
    const previewContainer = document.getElementById('previewContainer');
    const errorMessage = document.getElementById('errorMessage');

    let selectedFiles = [];

    photoInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewContainer.innerHTML = '';
        
        //validate the number of files the user has submitted
        if (files.length > 2){
            errorMessage.textContent = "You can only upload a maximum of two photos";
            photoInput.value = '';
            selectedFiles = [];
        } else{
            errorMessage.textContent = '';
            selectedFiles = Array.from(files); //storing files for later upload
        }

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img  =document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.style.width = '100px';
                img.style.margin = '5px';
                img.style.borderWidth = '5px';
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });

    });

    const form = document.getElementById('orderForm');
    
    form.addEventListener('reset', () => {
        previewContainer.innerHTML = '';
        errorMessage.textContent = '';
        selectedFiles = [];
    });

    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        form.reset();
    });

    form.addEventListener('submit', (event) => {
        if (selectedFiles.length === 0) {
          event.preventDefault();
          errorMessage.textContent = 'Please upload at least one photo';
          return;
        }
        // allow native submit
    });

});