
document.addEventListener('DOMContentLoaded', ()=>{
    const animElements = document.querySelectorAll(".animate");
    const observor = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); //Animate only once??
        }
      });
    },{
      threshold: 0.15
    });
    animElements.forEach(el => observor.observe(el));
});
