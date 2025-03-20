
const scriptURL = 'https://script.google.com/macros/s/AKfycbzcXtvh5bXpalPk-W7GKejD_fRdLiginh5HGwHp8D099p8qtMde7WBdmA2SqFg4qNiO/exec'

const form = document.forms['contact-form']

form.addEventListener('submit', e => {
  
  e.preventDefault()
  
  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
  .then(response => alert("Thank you! Form is submitted" ))
  .then(() => { window.location.reload(); })
  .catch(error => console.error('Error!', error.message))
})



  














    


  
      
  
        
    
    