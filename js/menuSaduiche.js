const sanduiche = document.getElementById('sanduiche');
const menu = document.getElementById('menu');
        
sanduiche.addEventListener('click', () => {
    menu.classList.toggle('active');
});

sanduiche.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        menu.classList.toggle('active');
    }
});