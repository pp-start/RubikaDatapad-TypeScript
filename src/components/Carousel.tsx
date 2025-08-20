import React, { useState, useEffect, useCallback } from "react";
import { useSwipeable, type SwipeableHandlers } from "react-swipeable";

type CarouselItemProps = {
    children: React.ReactNode;
    name: string;
    style?: React.CSSProperties;
};

export const CarouselItem = ({ children }: CarouselItemProps) => {
    return (
        <div className="carousel-item" style={{ width: "100%" }}>
            {children}
        </div>
    );
};

type CarouselProps = {
    children: React.ReactElement<CarouselItemProps>[];
};

const Carousel = ({ children }: CarouselProps) => {

    const [activeIndex, setActiveIndex] = useState<number>(0);

    const childrenCount: number = React.Children.count(children);

    const updateIndex = useCallback((newIndex: number): void => {

        if(newIndex < 0){

            newIndex = childrenCount - 1;

        } else if(newIndex >= childrenCount){

            newIndex = 0;
        }

        setActiveIndex(newIndex);

    }, []);

    useEffect(() => {

        if(childrenCount === activeIndex){

            updateIndex(activeIndex - 1)

        }

    }, [childrenCount, updateIndex]);

    const handlers: SwipeableHandlers = useSwipeable({
        onSwipedLeft: () => updateIndex(activeIndex + 1),
        onSwipedRight: () => updateIndex(activeIndex - 1)
    });

    const paginationWrapper: Element | null = document.querySelector('.pagination-wrapper');

    function prevSlide(){

        if(paginationWrapper){
            paginationWrapper.classList.add('transition-prev');
            updateIndex(activeIndex - 1);
            setTimeout(cleanClasses, 500);
        } else {
            updateIndex(activeIndex - 1);
        }
    }

    function nextSlide(){
        if(paginationWrapper){
        paginationWrapper.classList.add('transition-next');
        updateIndex(activeIndex + 1);
        setTimeout(cleanClasses, 500);
        } else {
        updateIndex(activeIndex + 1);
        }
    }

    function cleanClasses() {
        if(paginationWrapper && paginationWrapper.classList.contains('transition-next')){

            paginationWrapper.classList.remove('transition-next');

        } else if(paginationWrapper && paginationWrapper.classList.contains('transition-prev')){

            paginationWrapper.classList.remove('transition-prev');

        }

    }

    return (
        <div
            {...handlers}
            className="carousel"
        >
            <div
                className="inner"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
               {React.Children.map(children, (child) =>
                    React.cloneElement(child, {
                        style: { flex: "0 0 100%" }  // ensures each item takes full width
                    })
                )} 
            </div>
            <div id="carousel-slide-counter-wrapper">
                <p className="carousel-slide-counter">{children[activeIndex].props.name}</p>
            </div>
            <div className="pagination-wrapper indicators">
                <svg className="btn btn--prev" onClick={prevSlide} height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                    <path d="M0-.5h24v24H0z" fill="none"/>
                </svg>
                <div className="pagination-container">
                <div className="little-dot  little-dot--first"></div>
                <div className="little-dot">
                    <div className="big-dot-container">
                        <div className="big-dot"></div>
                    </div>
                </div>
                <div className="little-dot  little-dot--last"></div>
                </div>
                <svg className="btn btn--next" onClick={nextSlide} height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                    <path d="M0-.25h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div id="carousel-slide-counter-wrapper">
                <p className="carousel-slide-counter">Zdjęcie {activeIndex+1}/{childrenCount}</p>
            </div>
        </div>
    );
};

export default Carousel;