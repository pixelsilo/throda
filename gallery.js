document.addEventListener('DOMContentLoaded', () => {
    
    // Helper: Strips Shopify size suffixes and query strings for accurate matching
    const cleanUrl = (url) => {
        if (!url) return '';
        return url.split('?')[0].replace(/_[0-9]*x[0-9]*[a-zA-Z0-9_]*(\.[a-zA-Z0-9]+)$/, '$1');
    };

    // 1. Capture and Inject the Original Main Image
    const mainImgNode = document.querySelector('img[image="main"]');
    if (!mainImgNode) return;
    
    // Store original attributes so it doesn't get lost when variants change
    const initialSrc = mainImgNode.src;
    const initialSrcset = mainImgNode.srcset;

    const injectMainThumbnail = () => {
        const thumbContainer = document.querySelector('.product_image_thumb_holder.w-dyn-items') || document.querySelector('.product_image_thumb_holder');
        if (!thumbContainer || document.getElementById('injected-main-thumb')) return;

        // Check if it's already there to prevent duplicates
        const firstThumb = thumbContainer.querySelector('img[image="list"], img[image="thumb"]');
        if (firstThumb && cleanUrl(firstThumb.src) === cleanUrl(initialSrc)) return;

        const existingItem = thumbContainer.querySelector('.w-dyn-item');
        const thumbWrapper = document.createElement('div');
        thumbWrapper.className = existingItem ? existingItem.className : 'w-dyn-item w-dyn-repeater-item';
        thumbWrapper.id = 'injected-main-thumb';
        thumbWrapper.role = 'listitem';

        const imgClass = firstThumb ? firstThumb.className : 'product_image_thumb_image';
        const srcsetAttr = initialSrcset ? `srcset="${initialSrcset}"` : '';
        
        thumbWrapper.innerHTML = `<img class="${imgClass}" image="list" src="${initialSrc}" ${srcsetAttr}>`;
        thumbContainer.prepend(thumbWrapper);
    };
    
    injectMainThumbnail();

    // Ensure it stays injected even if Shopify's variant script completely rebuilds the thumbnail HTML
    const thumbContainerNode = document.querySelector('.product_image_thumb_holder.w-dyn-items') || document.querySelector('.product_image_thumb_holder');
    if (thumbContainerNode) {
        new MutationObserver(() => {
            if (!document.getElementById('injected-main-thumb')) injectMainThumbnail();
        }).observe(thumbContainerNode, { childList: true });
    }

    // 2. Centralized Image Updater
    const updateImage = (src, srcset) => {
        requestAnimationFrame(() => {
            const mainImg = document.querySelector('img[image="main"]');
            const lbImg = document.getElementById('lb-img');
            
            if (mainImg) {
                mainImg.src = src;
                srcset ? mainImg.setAttribute('srcset', srcset) : mainImg.removeAttribute('srcset');
            }
            if (lbImg) {
                lbImg.src = src;
                srcset ? lbImg.setAttribute('srcset', srcset) : lbImg.removeAttribute('srcset');
            }
        });
    };

    // 3. Arrow Navigation Logic
    const navigate = (dir) => {
        const mainImg = document.querySelector('img[image="main"]');
        if (!mainImg) return;
        
        const thumbs = document.querySelectorAll('img[image="list"], img[image="thumb"]');
        const len = thumbs.length;
        if (len === 0) return;

        const currentBaseUrl = cleanUrl(mainImg.src);
        let idx = 0;
        
        // Find current image in the loop
        for (let i = 0; i < len; i++) {
            if (cleanUrl(thumbs[i].src) === currentBaseUrl) {
                idx = i;
                break;
            }
        }

        // Loop index forward or backward
        idx = dir === 'left' ? (idx === 0 ? len - 1 : idx - 1) : (idx === len - 1 ? 0 : idx + 1);
        updateImage(thumbs[idx].src, thumbs[idx].srcset);
    };

    // 4. Lean Lightbox Generation
    const openLightbox = (src, srcset) => {
        let lb = document.getElementById('custom-gallery-lightbox');
        if (!lb) {
            const leftBtn = document.querySelector('[image="left"]')?.outerHTML || '';
            const rightBtn = document.querySelector('[image="right"]')?.outerHTML || '';

            lb = document.createElement('div');
            lb.id = 'custom-gallery-lightbox';
            lb.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
            lb.innerHTML = `
                <div id="lb-close" style="position:absolute;top:20px;right:30px;color:white;font-size:40px;cursor:pointer;z-index:2;padding:10px;">&times;</div>
                <div style="position:absolute;left:20px;z-index:2;">${leftBtn}</div>
                <img id="lb-img" style="max-width:85%;max-height:85vh;object-fit:contain;z-index:1;" />
                <div style="position:absolute;right:20px;z-index:2;">${rightBtn}</div>
            `;
            document.body.appendChild(lb);
        }
        
        const lbImg = document.getElementById('lb-img');
        lbImg.src = src;
        srcset ? lbImg.setAttribute('srcset', srcset) : lbImg.removeAttribute('srcset');
        lb.style.display = 'flex';
    };

    // 5. Unified Event Delegation
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        const thumb = target.closest('img[image="list"], img[image="thumb"]');
        if (thumb) return updateImage(thumb.src, thumb.srcset);

        if (target.closest('[image="left"]')) return navigate('left');
        if (target.closest('[image="right"]')) return navigate('right');

        const mainImgClick = target.closest('img[image="main"]');
        if (mainImgClick) return openLightbox(mainImgClick.src, mainImgClick.srcset);

        const lb = document.getElementById('custom-gallery-lightbox');
        if (lb && (target === lb || target.closest('#lb-close'))) {
            lb.style.display = 'none';
        }
    });
});