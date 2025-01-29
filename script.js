let controller;

async function searchMovies(query) {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch('https://ghibliapi.vercel.app/films', { signal });
        const movies = await response.json();
        console.log(movies);
        // Filtrar películas por título o descripción
        const filteredMovies = movies.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.description.toLowerCase().includes(query.toLowerCase())
        );

        return filteredMovies;
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Búsqueda cancelada");
            return null;
        }
        throw error;
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie__card';

    const title = document.createElement('h3');
    title.className = 'movie__title';
    title.textContent = movie.title;

    const image = document.createElement('img');
    image.className = 'movie__image';
    image.src = movie.image;
    image.alt = movie.title;

    const description = document.createElement('p');
    description.className = 'movie__description';
    description.textContent = movie.description;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'movie__meta';

    const directorSpan = document.createElement('span');
    directorSpan.textContent = `Director: ${movie.director}`;

    const producerSpan = document.createElement('span');
    producerSpan.textContent = ` | Productor: ${movie.producer}`;

    const yearSpan = document.createElement('span');
    yearSpan.textContent = ` | Año: ${movie.release_date}`;

    metaDiv.appendChild(directorSpan);
    metaDiv.appendChild(producerSpan);
    metaDiv.appendChild(yearSpan);
    
    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(description);
    card.appendChild(metaDiv);
    
    return card;
}

function clearResults(resultsElement) {
    while (resultsElement.firstChild) {
        resultsElement.removeChild(resultsElement.firstChild);
    }
}

const input = document.getElementById("search");
const results = document.getElementById("results");

// Mensaje inicial
const emptyDiv = document.createElement('div');
emptyDiv.className = 'loading';
emptyDiv.textContent = 'Busca películas por título o descripción';
results.appendChild(emptyDiv);

input.addEventListener("input", async (event) => {
    const query = event.target.value.trim();

    if (query === "") {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'loading';
        emptyDiv.textContent = 'Busca películas por título o descripción';
        clearResults(results);
        results.appendChild(emptyDiv);
        return;
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Buscando películas...';
    clearResults(results);
    results.appendChild(loadingDiv);

    try {
        const movies = await searchMovies(query);

        if (movies === null) {
            return; // Búsqueda cancelada
        }

        clearResults(results);

        if (movies.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'loading';
            noResultsDiv.textContent = 'No se encontraron películas';
            results.appendChild(noResultsDiv);
            return;
        }

        movies.forEach(movie => {
            const card = createMovieCard(movie);
            results.appendChild(card);
        });
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = 'Error al buscar películas';
        clearResults(results);
        results.appendChild(errorDiv);
    }
});
