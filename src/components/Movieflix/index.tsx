import React, { useState, useEffect } from "react";
import "./index.css";

// The main component for the Movieflix application
const Movieflix: React.FC = () => {
  // State variables to manage movies, current year, loading state, and all movies loaded flag
  const [movies, setMovies] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(2012);
  const [loading, setLoading] = useState<boolean>(false);
  const [allMoviesLoaded, setAllMoviesLoaded] = useState<boolean>(false);

  // Movies are fetched when the component mounts or when the current year changes
  useEffect(() => {
    fetchMovies();
  }, [currentYear]);

  // Scroll event listener is added to handle infinite scrolling
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch movies from the API
  const fetchMovies = async () => {
    if (!allMoviesLoaded) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=2dca580c2a14b55200e784d157207b4d&sort_by=popularity.desc&primary_release_year=${currentYear}&page=1&vote_count.gte=100`
        );
        const data = await response.json();
        setMovies((prevMovies) => [...prevMovies, ...data.results]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    }
  };

  // Handle scroll event for infinite scrolling
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !loading
    ) {
      setCurrentYear((prevYear) => prevYear + 1);
    }
  };

  // Handle click event of categories
  const handleCategoryClick = async (category: string) => {
    setLoading(true);
    try {
      let url;
      if (category === "all") {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=2dca580c2a14b55200e784d157207b4d&sort_by=popularity.desc&primary_release_year=${currentYear}&page=1&vote_count.gte=100`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=2dca580c2a14b55200e784d157207b4d&sort_by=popularity.desc&with_genres=${category}&page=1&vote_count.gte=100`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies by category:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div>
        <h1 className="movie-header">Movieflix</h1>
        <FilterBar onCategoryClick={handleCategoryClick} />
        <MovieList movies={movies} />
        {loading && <div className="loading-spinner"></div>}
      </div>
    </div>
  );
};

// Component to display the list of movies
const MovieList: React.FC<{ movies: any[] }> = ({ movies }) => {
  // Group movies by year
  const groupedMovies = groupByYear(movies);

  return (
    <div>
      {Object.keys(groupedMovies).map((year) => (
        <div key={year} className="movie-year">
          <h2>{year}</h2>
          <div className="movie-row">
            {groupedMovies[year].map((movie: any) => (
              <div key={movie.id} className="movie-card">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                <div className="movie-info">
                  <h4 className="movie-title">{movie.title}</h4>
                  <p className="movie-rating">
                    Rating: {movie.vote_average.toFixed(1)}
                  </p>{" "}
                  {/* Rounded rating to a single digit */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for the filter bar with category buttons
const FilterBar: React.FC<{ onCategoryClick: (category: string) => void }> = ({
  onCategoryClick,
}) => {
  // Define categories
  const categories = [
    { id: "all", name: "All" },
    { id: "28", name: "Action" },
    { id: "12", name: "Adventure" },
    { id: "16", name: "Animation" },
    { id: "35", name: "Comedy" },
    { id: "80", name: "Crime" },
  ];

  // State variable to manage the active category
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Handle button click event
  const handleButtonClick = (category: string) => {
    setActiveCategory(category);
    onCategoryClick(category);
  };

  return (
    <div className="filter-bar">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`filter-button ${
            activeCategory === category.id ? "active" : ""
          }`}
          onClick={() => handleButtonClick(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

// Function to group movies by year
const groupByYear = (movies: any[]) => {
  return movies.reduce((acc, movie) => {
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear().toString()
      : "Unknown";
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(movie);
    return acc;
  }, {} as { [year: string]: any[] });
};

export default Movieflix;
