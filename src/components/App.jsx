import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { ImageGallery } from './ImageGallery';
import { Searchbar } from './searchbar/Searchbar';
import { Loader } from './Loader';
import { LoadMoreButton } from './LoadMoreButton';
import { Modal } from './modal/Modal';

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '39010846-94b79845e5a284c0e487aa25e';
const perPage = 12;

export const App = () => {
  const [page, setPage] = useState(1);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [modalIsHidden, setModalIsHidden] = useState(true);
  const [modalImage, setModalImage] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const query = e.currentTarget.query.value;
    setQuery(query);
    setIsLoading(true);
    setPage(1);
  };

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPage(page + 1);
    }, 200);
  };

  const closeModal = () => {
    setModalIsHidden(true);
    setModalImage('');
    window.removeEventListener('keydown', handlePressEscape);
  };

  const handlePressEscape = e => {
    return e.code === 'Escape' ? closeModal() : null;
  };

  const openModal = url => {
    setModalIsHidden(false);
    setModalImage(url);
    window.addEventListener('keydown', handlePressEscape);
  };

  useEffect(() => {
    const fetchData = async (query, page) => {
      const response = await axios.get(`${BASE_URL}`, {
        params: {
          key: KEY,
          q: query,
          imageType: 'photo',
          orientation: 'horizontal',
          page: page,
          per_page: perPage,
        },
      });

      if (query) {
        if (page === 1) {
          if (response.data.totalHits === 0) {
            setIsLoading(false);
            return Notify.failure(
              `Sorry, there are no images matching your search query. Please try again.`
            );
          }
          setTimeout(() => {
            Notify.success(
              `Hooray! We found ${response.data.totalHits} images.`
            );
            setIsLoading(false);
            setImages(response.data.hits);
            setShowLoadMore(response.data.totalHits > perPage ? true : false);
          }, 200);
        } else {
          const newImages = [...images, ...response.data.hits];
          setImages(newImages);
          setIsLoading(false);
          setShowLoadMore(newImages.length < perPage ? false : true);
        }
      }
    };

    fetchData(query, page);
    // eslint-disable-next-line
  }, [query, page]);

  return (
    <>
      <Searchbar handleSubmit={handleSubmit} />
      {images.length > 0 && (
        <ImageGallery images={images} openModal={openModal} />
      )}
      {isLoading && <Loader />}
      {showLoadMore && <LoadMoreButton loadMore={loadMore} />}
      <Modal
        closeModal={closeModal}
        isHidden={modalIsHidden}
        largeImageURL={modalImage}
      />
    </>
  );
};
