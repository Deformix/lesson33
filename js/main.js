window.onload = () => {
    const xhr = new XMLHttpRequest();
    const input = document.getElementById("name");
    const select = document.getElementById("select");
    const submit = document.getElementById("submit");
    const moviesList = document.getElementById("movie-list");
    const pagination = document.getElementById("pagination");
    const modal = document.getElementById("modal");
    const modalClose = document.getElementById("modal-close");
    const favBtn = document.getElementById("favorite");
    let btnNext = document.createElement("button");
    let btnPrevious = document.createElement("button");
    let localMovies = JSON.parse(localStorage.localMovies || '[]');
    let page = 1;

    btnNext.innerText = "Next";
    btnPrevious.innerText = "Previous";

    function parse(name, type, _page, pagePos) {
        _page = _page + pagePos;
        page = _page;

        let url = `https://www.omdbapi.com/?s=${name}&type=${type}&page=${page}&apikey=7b9ce72f`;

        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                renderData(JSON.parse(xhr.responseText));
            }
        };

        xhr.send();
    }

    function renderData(data) {
        moviesList.innerHTML = '';

        for (let i = 0; i < data.Search.length; i++) {
            let item = document.createElement('div');
            let inner = document.createElement('div');
            let moviePoster = document.createElement('img');
            let movieTitle = document.createElement('p');
            let movieYear = document.createElement('p');
            let detailsButton = document.createElement('button');
            let favoriteButton = document.createElement('button');
            let addedFavorite = false;

            item.classList.add("movie-list__item");
            inner.classList.add("movie-list__item-inner");
            moviePoster.setAttribute("src", `${data.Search[i].Poster}`);
            inner.appendChild(moviePoster);
            movieTitle.classList.add('movie-list__item-title');
            movieTitle.innerText = `${data.Search[i].Title}`;
            movieYear.classList.add('movie-list__item-year');
            movieYear.innerText = `${data.Search[i].Year}`;
            favoriteButton.classList.add("btn-details", "btn-details--fav");
            detailsButton.innerText = "Details";
            detailsButton.classList.add("btn-details");
            detailsButton.addEventListener('click', () => {
                getFullInfo(data.Search[i].imdbID);
            });

            for (let j = 0; j < localMovies.length; j++) {

                if (data.Search[i].imdbID == localMovies[j].id) {
                    addedFavorite = true;
                }
            }

            if (addedFavorite == true) {
                favoriteButton.innerText = 'Remove';
                favoriteButton.classList.add('btn-details--rm-fav');
                favoriteButton.classList.remove('btn-details--fav');
            } else {
                favoriteButton.innerText = 'Add';
            }

            favoriteButton.addEventListener('click', function () {
                addFavorite(data.Search[i].imdbID, this);
            });

            item.appendChild(inner);
            item.appendChild(movieTitle);
            item.appendChild(movieYear);
            item.appendChild(detailsButton);
            item.appendChild(favoriteButton);
            moviesList.appendChild(item);
        }

        document.getElementById("nav-buttons").appendChild(btnPrevious);
        document.getElementById("nav-buttons").appendChild(btnNext);

        if (page == 1) {
            btnPrevious.disabled = true;
        } else {
            btnPrevious.disabled = false;
        }

        if (page >= (parseInt(data.totalResults) / 10)) {
            btnNext.disabled = true;
        } else {
            btnNext.disabled = false;
        }

        let pagesCount = Math.ceil(parseInt(data.totalResults) / 10);
        let ul = document.createElement('ul');

        ul.classList.add('pagination__list');
        pagination.innerHTML = '';

        for (let i = 0; i < pagesCount; i++) {
            let li = document.createElement('li');
            let a = document.createElement('a');

            li.classList.add('pagination__list-item');
            a.innerText = i + 1;
            a.setAttribute("href", "#");
            a.addEventListener('click', () => {
                    parse(input.value, select.value, i + 1, 0);
                });

            li.appendChild(a);
            ul.appendChild(li);
        }
        pagination.appendChild(ul);
    }

    function getFullInfo(imdbID) {
        let url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=7b9ce72f`;

        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                data = JSON.parse(xhr.responseText);
            }

            document.getElementById('image').setAttribute('src', `${data.Poster}`);
            document.getElementById('heading').innerHTML = `${data.Title}`;
            document.getElementById('year').innerHTML = `${data.Year}`;
            document.getElementById('description').innerHTML = `${data.Plot}`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        };
        xhr.send();
    }



    function showFavorite() {
        moviesList.innerHTML = '';

        if (localMovies.length == 0) {
            return;
        }

        for (let i = 0; i < localMovies.length; i++) {
            fetch(`https://www.omdbapi.com/?i=${localMovies[i].id}&plot=full&apikey=c19ba406`)
                .then(response => response.json())
                .then((myJson) => {
                        let data = myJson;
                        let item = document.createElement('div');
                        let inner = document.createElement('div');
                        let moviePoster = document.createElement('img');
                        let movieTitle = document.createElement('p');
                        let movieYear = document.createElement('p');
                        let favoriteButton = document.createElement('button');
                        let id = data.imdbID;

                        item.classList.add("movie-list__item");
                        inner.classList.add("movie-list__item-inner");
                        moviePoster.setAttribute("src", `${data.Poster}`);
                        inner.appendChild(moviePoster);
                        movieTitle.classList.add('movie-list__item-title');
                        movieTitle.innerText = `${data.Title}`;
                        movieYear.classList.add('movie-list__item-year');
                        movieYear.innerText = `${data.Year}`;
                        favoriteButton.classList.add("btn-details", "btn-details--rm-fav");
                        favoriteButton.innerText = 'Remove';
                        favoriteButton.addEventListener('click', function () {
                            removeFavorite(id);
                        });
                        item.appendChild(inner);
                        item.appendChild(movieTitle);
                        item.appendChild(movieYear);
                        item.appendChild(favoriteButton);
                        moviesList.appendChild(item);
                    });
        }
    }

    function addFavorite(_id, _button) {
        let btn = _button;
        let present = false;
        let arrayIndex = '';

        for (let i = 0; i < localMovies.length; i++) {

            if (_id == localMovies[i].id) {
                present = true;
                arrayIndex = i;
            }
        }

        if (present == false) {
            localMovies.push({ 'id': `${_id}` });
            localStorage.setItem("localMovies", JSON.stringify(localMovies));
            btn.innerText = 'Remove';
            btn.classList.add('btn-details--rm-fav');
            btn.classList.remove('btn-details--fav');
        }

        if (present == true) {
            localMovies.splice(arrayIndex, 1);
            localStorage.setItem("localMovies", JSON.stringify(localMovies));
            btn.innerText = 'Add';
            btn.classList.add('btn-details--fav');
            btn.classList.remove('btn-details--rm-fav');
        }

        present = false;
        arrayIndex = '';
    }

    function removeFavorite(_id) {
        let arrayIndex = '';

        for (let i = 0; i < localMovies.length; i++) {

            if (_id == localMovies[i].id) {
                arrayIndex = i;
            }
        }

        localMovies.splice(arrayIndex, 1);
        localStorage.setItem("localMovies", JSON.stringify(localMovies));
        arrayIndex = '';
        showFavorite();
    }

    submit.addEventListener('click', () => {
        parse(input.value, select.value, page, 0);
    });

    btnNext.addEventListener('click', () => {
        parse(input.value, select.value, page, 1);
    });

    btnPrevious.addEventListener('click', () => {
        parse(input.value, select.value, page, -1);
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    favBtn.addEventListener('click', () => {
        showFavorite();
    });
};
