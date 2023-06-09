const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "ad0175860emshc39bb79d0bdab00p107aecjsn4ca9b1647bdb",
    "X-RapidAPI-Host": "sephora.p.rapidapi.com",
  },
};

const getAPICategoriesData = async () => {
  const api_url = "https://sephora.p.rapidapi.com/categories/v2/list?number=1&size=100&country=SG&language=en-SG";
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getCategories(data);
  } catch (err) {
    console.error(err);
  }
};
getAPICategoriesData();

const removeFilterUrlParams = () => {
  let params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    if (!key.startsWith("slug-url") && !key.startsWith("sort")) params.delete(key);
  });
  history.pushState("", "", `products.html?${params}`);
};

const getUrlSlugUrl = (slugUrl, currentProduct) => {
  let params = new URLSearchParams(window.location.search);
  if (slugUrl != "") {
    params.set("slug-url", slugUrl);
  }
  params.set("sort", "sales");
  params.forEach((value, key) => {
    if (key.startsWith("filters")) params.delete(key);
  });
  params.forEach((value, key) => {
    if (key.startsWith("product_group")) params.delete(key);
  });
  params.forEach((value, key) => {
    if (key.startsWith("brands")) params.delete(key);
  });
  params.forEach((value, key) => {
    if (key.startsWith("product")) params.delete(key);
  });
  if (currentProduct) {
    params.delete("sort");
    params.set("product", `${currentProduct.name}[${currentProduct.id}]`);
  }
  return params;
};

const getCurrentProductUrlId = () => {
  let params = new URLSearchParams(window.location.search);
  let product = params.get("product");
  let productId = product.substring(product.indexOf("[") + 1, product.lastIndexOf("]"));
  return productId;
};

const getCategories = (data) => {
  const dataHeaderNavList = document.querySelector("[data-header-nav-list]");
  const dataHeaderNavListTemplate = document.querySelector("[data-header-nav-list-template]");

  const headerNavItemSkeleton = document.querySelectorAll(".header-nav-item-skeleton");
  headerNavItemSkeleton.forEach((item) => item.remove());

  data.data.forEach((element) => {
    if (element.relationships.parent.data == null) {
      const item = dataHeaderNavListTemplate.content.cloneNode(true);
      const itemParent = item.querySelector("[data-header-nav-item]");
      const item_aLink = item.querySelector("[data-header-nav-item-aLink]");
      itemParent.dataset.id = element.id;
      item_aLink.dataset.id = element.id;
      item_aLink.textContent = element.attributes.label;
      item_aLink.href = `products.html?${getUrlSlugUrl(element.attributes["slug-url"])}`;

      dataHeaderNavList.append(item);
    }
  });
  window.addEventListener("mouseover", (e) => {
    const navFlyoutMenu = document.querySelector(".nav-flyout-menu");
    const navFlyoutItems = document.querySelectorAll(".nav-flyout-item");
    if (
      !e.target.closest(".header-nav-item") &&
      !e.target.closest(".nav-flyout-menu") &&
      !e.target.closest(".header-nav")
    ) {
      navFlyoutMenu.classList.remove("active-grid");
      navFlyoutItems.forEach((item) => item.remove());
      document.querySelectorAll(".header-nav-item").forEach((item) => item.classList.remove("header-nav-active"));
      return;
    }
    if (e.target.closest(".header-nav-item")) {
      document.querySelectorAll(".header-nav-item").forEach((item) => item.classList.remove("header-nav-active"));
      e.target.parentElement.classList.add("header-nav-active");
      navFlyoutItems.forEach((item) => item.remove());

      navFlyoutMenu.classList.add("active-grid");

      let currentId = e.target.getAttribute("data-id");
      const dataNavFlyoutMenu = document.querySelector("[data-nav-flyout-menu]");
      const dataNavFlyoutItemTemplate = document.querySelector("[data-nav-flyout-item-template]");
      data.data.forEach((element) => {
        let childsArray = [];
        if (element.relationships.parent.data != null) {
          if (element.relationships.parent.data.id == currentId) {
            const item = dataNavFlyoutItemTemplate.content.cloneNode(true);
            const itemParent = item.querySelector("[data-nav-flyout-item]");
            const itemHeader_aLnik = item.querySelector("[data-nav-flyout-item-header-link]");
            itemParent.dataset.id = element.id;
            itemHeader_aLnik.textContent = element.attributes.label;
            itemHeader_aLnik.href = `products.html?${getUrlSlugUrl(element.attributes["slug-url"])}`;
            dataNavFlyoutMenu.append(item);
            childsArray.push(element.relationships.children.data);
          }
        }
        if (childsArray.length == 0) return;
        childsArray[0].forEach((child) => {
          data.data.forEach((element2) => {
            if (child.id == element2.id) {
              const dataNavFlyoutItemLinks = document
                .querySelector(`[data-nav-flyout-item][data-id='${element2.relationships.parent.data.id}']`)
                .querySelector("[data-nav-flyout-item-links]");
              const item_aLink = document.querySelector("[data-nav-flyout-item-link]");

              item_aLink.textContent = element2.attributes.label;
              item_aLink.href = `products.html?${getUrlSlugUrl(element2.attributes["slug-url"])}`;
              dataNavFlyoutItemLinks.append(item_aLink.cloneNode(true));
            }
          });
        });
      });
    }
  });
};

const convertPrice = (price) => {
  price = price.toString();
  switch (price.length) {
    case 3:
      return `$${price.slice(0, 1)}.${price.slice(1, 3)}`;
    case 4:
      return `$${price.slice(0, 2)}.${price.slice(2, 4)}`;
    case 5:
      return `$${price.slice(0, 3)}.${price.slice(3, 5)}`;
  }
};

//<<---------------INDEX.HTML--------------->>//

const getAPIBestsellers = async () => {
  const api_url =
    "https://sephora.p.rapidapi.com/products/v2/list?number=1&size=30&country=SG&language=en-SG&sort=sales&product_group=bestsellers";
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getBestsellers(data);
  } catch (err) {
    console.error(err);
  }
};

const getBestsellers = (data) => {
  document.querySelectorAll(".product-item-skeleton").forEach((item) => item.remove());

  const dataBestsellersProductList = document.querySelector("[data-bestsellers-product-list]");
  const dataBestsellersProductItemTemplate = document.querySelector("[data-bestsellers-product-item-template]");
  data.data.forEach((element) => {
    const item = dataBestsellersProductItemTemplate.content.cloneNode(true);
    const itemId = item.querySelector("[data-bestsellers-product-item-id]");
    const itemImage = item.querySelector("[data-bestsellers-product-item-image]");
    const itemName = item.querySelector("[data-bestsellers-product-item-name]");
    const itemCapacity = item.querySelector("[data-bestsellers-product-item-capacity]");
    const itemRating = item.querySelector("[data-bestsellers-product-item-rating]");
    const itemRevies = item.querySelector("[data-bestsellers-product-revies]");
    const itemOriginalPrice = item.querySelector("[data-bestsellers-product-item-originalPrice]");
    const itemPrice = item.querySelector("[data-bestsellers-product-item-price]");

    let currentProductData = {
      id: element.id,
      name: element.attributes.name,
    };
    item.querySelector("a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

    itemId.textContent = element.id;
    itemImage.src = element.attributes["default-image-urls"][0];
    if (element.attributes["default-image-urls"].length > 1) {
      itemImage.setAttribute("onmouseover", `this.src='${element.attributes["default-image-urls"][1]}'`);
      itemImage.setAttribute("onmouseout", `this.src='${element.attributes["default-image-urls"][0]}'`);
    }
    itemName.textContent = element.attributes.name;
    if (element.attributes.heading == "" || element.attributes.heading == null) {
      item.querySelector(".product-item-info-header-capacity").style.display = "none";
    }
    itemCapacity.textContent = element.attributes.heading;
    itemRating.textContent = element.attributes.rating;
    itemRevies.textContent = `(${element.attributes["reviews-count"]})`;
    if (element.attributes["under-sale"]) itemPrice.textContent = convertPrice(element.attributes.price);
    itemOriginalPrice.textContent = convertPrice(element.attributes["original-price"]);

    dataBestsellersProductList.append(item);
  });
  addToBasketPreFunction("index");
};

const getAPINewArrivals = async () => {
  const api_url =
    "https://sephora.p.rapidapi.com/products/v2/list?number=1&size=30&country=SG&language=en-SG&sort=sales&product_group=new-arrivals";
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getNewArrivals(data);
  } catch (err) {
    console.error(err);
  }
};

const getNewArrivals = (data) => {
  document.querySelectorAll(".product-item-skeleton").forEach((item) => item.remove());

  const dataNewArrivalsProductList = document.querySelector("[data-newArrivals-product-list]");
  const dataNewArrivalsProductItemTemplate = document.querySelector("[data-newArrivals-product-item-template]");
  data.data.forEach((element) => {
    const item = dataNewArrivalsProductItemTemplate.content.cloneNode(true);
    const itemId = item.querySelector("[data-newArrivals-product-item-id]");
    const itemImage = item.querySelector("[data-newArrivals-product-item-image]");
    const itemName = item.querySelector("[data-newArrivals-product-item-name]");
    const itemCapacity = item.querySelector("[data-newArrivals-product-item-capacity]");
    const itemRating = item.querySelector("[data-newArrivals-product-item-rating]");
    const itemRevies = item.querySelector("[data-newArrivals-product-revies]");
    const itemOriginalPrice = item.querySelector("[data-newArrivals-product-item-originalPrice]");
    const itemPrice = item.querySelector("[data-newArrivals-product-item-price]");

    let currentProductData = {
      id: element.id,
      name: element.attributes.name,
    };
    item.querySelector("a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

    itemId.textContent = element.id;
    itemImage.src = element.attributes["default-image-urls"][0];
    if (element.attributes["default-image-urls"].length > 1) {
      itemImage.setAttribute("onmouseover", `this.src='${element.attributes["default-image-urls"][1]}'`);
      itemImage.setAttribute("onmouseout", `this.src='${element.attributes["default-image-urls"][0]}'`);
    }
    itemName.textContent = element.attributes.name;
    if (element.attributes.heading == "" || element.attributes.heading == null) {
      item.querySelector(".product-item-info-header-capacity").style.display = "none";
    }
    itemCapacity.textContent = element.attributes.heading;
    itemRating.textContent = element.attributes.rating;
    itemRevies.textContent = `(${element.attributes["reviews-count"]})`;
    if (element.attributes["under-sale"]) itemPrice.textContent = convertPrice(element.attributes.price);
    itemOriginalPrice.textContent = convertPrice(element.attributes["original-price"]);

    dataNewArrivalsProductList.append(item);
  });
  addToBasketPreFunction("index");
};
const headerMainSearchContainer = document.querySelector(".header-main-search-container");
let timer;
const searchInput = document.querySelector(".header-search-input");
searchInput.addEventListener("input", () => {
  const value = searchInput.value;
  if (value.length < 3) return;
  clearTimeout(timer);
  headerMainSearchContainer.style.display = "block";
  const headerMainSearchItems = document.querySelectorAll(".header-main-search-container a");
  headerMainSearchItems.forEach((item) => item.remove());
  const searchSkeletonItems = document.querySelectorAll(".header-main-search-item-skeleton");
  searchSkeletonItems.forEach((item) => item.remove());
  skeletonSearch();
  timer = setTimeout(() => {
    getAPISearchItems(value, 1);
  }, 1500);
});

window.addEventListener("click", (e) => {
  if (!e.target.closest(".header-main-search-container") && !e.target.closest(".header-main-search")) {
    headerMainSearchContainer.style.display = "none";
    const headerMainSearchItems = document.querySelectorAll(".header-main-search-container a");
    headerMainSearchItems.forEach((item) => item.remove());
  }
});
let searchPageNumber;
const getAPISearchItems = async (value, pageNumber) => {
  searchPageNumber = pageNumber;
  const api_url = `https://sephora.p.rapidapi.com/products/v2/list?number=${pageNumber}&size=30&country=SG&language=en-SG&query=${value}&sort=sales`;
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getSearchItems(data);
  } catch (err) {
    console.error(err);
  }
};

const getSearchItems = (data) => {
  const dataHeaderMainSearchContainer = document.querySelector("[data-header-main-search-container]");
  const dataSearchItemTemplate = document.querySelector("[data-search-item-template]");

  const searchSkeletonItems = document.querySelectorAll(".header-main-search-item-skeleton");
  searchSkeletonItems.forEach((item) => item.remove());
  data.data.forEach((element) => {
    const item = dataSearchItemTemplate.content.cloneNode(true);
    const itemImage = item.querySelector("[data-search-item-image]");
    const itemName = item.querySelector("[data-search-item-name]");
    const itemCapacity = item.querySelector("[data-search-item-capacity]");
    const itemPromo = item.querySelector("[data-search-item-promo]");
    const itemRating = item.querySelector("[data-search-item-rating]");
    const itemRevies = item.querySelector("[data-search-item-reviews]");
    const itemOriginalPrice = item.querySelector("[data-search-item-originalPrice]");
    const itemPrice = item.querySelector("[data-search-item-price]");

    let currentProductData = {
      id: element.id,
      name: element.attributes.name,
    };
    item.querySelector("a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

    itemImage.src = element.attributes["default-image-urls"][0];
    itemName.textContent = element.attributes.name;
    itemCapacity.textContent = element.attributes.heading;
    element.attributes["new-arrival"] == false
      ? (itemPromo.style.display = "none")
      : (itemPromo.style.display = "block");
    itemRating.textContent = element.attributes.rating;
    itemRevies.textContent = `(${element.attributes["reviews-count"]})`;
    if (element.attributes["original-price"] == element.attributes.price) {
      itemOriginalPrice.textContent = convertPrice(element.attributes["original-price"]);
    } else {
      itemOriginalPrice.textContent = convertPrice(element.attributes["original-price"]);
      itemPrice.textContent = convertPrice(element.attributes.price);
    }

    dataHeaderMainSearchContainer.append(item);
  });
  searchObserver.observe(document.querySelector(".header-main-search-container a:last-child"));
};

const searchObserver = new IntersectionObserver((entries) => {
  const lastItem = entries[0];
  if (!lastItem.isIntersecting) return;

  searchObserver.unobserve(lastItem.target);

  skeletonSearch();
  const searchInput = document.querySelector(".header-search-input");
  const value = searchInput.value;
  searchPageNumber++;
  getAPISearchItems(value, searchPageNumber);
});

document.querySelector(".search-clearInput-icon").addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
});

const skeletonSearch = () => {
  const html = `<div class="header-main-search-item-skeleton">
  <div class="header-main-search-item-image">
    <div class="loader-parent">
      <span class="loader"></span>
    </div>
  </div>
  <div class="header-main-search-item-info">
    <div class="search-item-info-header">
      <span class="search-item-info-header-name skeleton"></span>
    </div>
    <div class="search-item-info-middle">
      <div class="search-item-info-middle-rating">
        <span class="rating skeleton"></span>
        <span class="revies-count skeleton"></span>
      </div>
    </div>
    <div class="search-item-info-footer">
      <span class="search-item-info-footer-original-price skeleton"></span>
    </div>
  </div>
</div>`;
  for (let i = 0; i < 8; i++) {
    headerMainSearchContainer.insertAdjacentHTML("beforeend", html);
  }
};
const headerNavList = document.querySelector(".header-nav-list");
const skeletonNavigation = () => {
  const html = `<li class="header-nav-item-skeleton"></li>`;
  for (let i = 0; i < 8; i++) {
    headerNavList.insertAdjacentHTML("afterbegin", html);
  }
};
skeletonNavigation();

const changeBannerImage = (offset) => {
  const slides = document.querySelector(".image-banner-carousel-list");
  let pos = 0;
  typeof offset == "undefined" ? pos++ : (pos = offset === "next" ? 1 : -1);

  const activeSlide = slides.querySelector("[data-active]");
  let newIndex = [...slides.children].indexOf(activeSlide) + pos;

  if (newIndex < 0) newIndex = slides.children.length - 1;
  if (newIndex >= slides.children.length) newIndex = 0;
  slides.children[newIndex].dataset.active = true;
  delete activeSlide.dataset.active;
};

if (document.body.id == "index") {
  let imageInterval = setInterval(changeBannerImage, 5000);

  const imageBannerCarouselButtons = document.querySelectorAll(".image-banner-carousel-button");
  imageBannerCarouselButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const offset = btn.dataset.carouselButton;
      changeBannerImage(offset);

      clearInterval(imageInterval);
      imageInterval = setInterval(changeBannerImage, 5000);
    });
  });
  changeBannerImage();
}
//<<---------------PRODUCTS.HTML--------------->>//

//PREHEADER--------------->>//

const getAPIPreHeaderProducts = async (slugUrl) => {
  const api_url = `https://sephora.p.rapidapi.com/products/v2/list?number=1&size=30&country=SG&language=en-SG&sort=sales&product_group=bestsellers&root_category=${slugUrl}`;
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getPreHeaderProducts(data);
  } catch (err) {
    console.error(err);
  }
};

const getPreHeaderProducts = (data) => {
  const dataPreHeaderContainer = document.querySelector("[data-preHeader-container]");
  const dataPreHeaderItemTemplate = document.querySelector("[data-preHeader-item-template]");

  document.querySelectorAll(".main__products-preHeader-item-skeleton").forEach((item) => item.remove());

  data.data.forEach((product) => {
    const item = dataPreHeaderItemTemplate.content.cloneNode(true);

    const preHeaderItemName = item.querySelector("[data-preHeader-item-name]");
    const preHeaderItemImage = item.querySelector("[ data-preHeader-item-image]");

    const itemId = item.querySelector("[data-preHeader-item-upperItem-id]");
    const itemImage = item.querySelector("[data-preHeader-item-upperItem-image]");
    const itemName = item.querySelector("[data-preHeader-item-upperItem-name]");
    const itemCapacity = item.querySelector("[data-preHeader-item-upperItem-capacity]");
    const itemRating = item.querySelector("[data-preHeader-item-upperItem-rating]");
    const itemRevies = item.querySelector("[data-preHeader-item-upperItem-revies]");
    const itemOriginalPrice = item.querySelector("[data-preHeader-item-upperItem-originalPrice]");
    const itemPrice = item.querySelector("[data-preHeader-item-upperItem-price]");

    preHeaderItemName.textContent = product.attributes.name;
    preHeaderItemImage.src = product.attributes["cart-image-urls"][0];

    let currentProductData = {
      id: product.id,
      name: product.attributes.name,
    };
    item.querySelector("a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

    itemId.textContent = product.id;
    itemImage.src = product.attributes["default-image-urls"][0];
    if (product.attributes["default-image-urls"].length > 1) {
      itemImage.setAttribute("onmouseover", `this.src='${product.attributes["closeup-image-urls"][1]}'`);
      itemImage.setAttribute("onmouseout", `this.src='${product.attributes["closeup-image-urls"][0]}'`);
    }
    itemName.textContent = product.attributes.name;
    if (product.attributes.heading == "" || product.attributes.heading == null) {
      item.querySelector(".product-item-info-header-capacity").style.display = "none";
    }
    if (!product.attributes["new-arrival"]) item.querySelector(".product-item-info-promo-na").style.display = "none";
    itemCapacity.textContent = product.attributes.heading;
    itemRating.textContent = product.attributes.rating;
    itemRevies.textContent = `(${product.attributes["reviews-count"]})`;
    if (product.attributes["under-sale"])
      itemOriginalPrice.textContent = convertPrice(product.attributes["original-price"]);
    itemPrice.textContent = convertPrice(product.attributes.price);

    dataPreHeaderContainer.append(item);
  });

  addToBasketPreFunction("products");

  const main__productsPreHeaderItems = document.querySelectorAll(".main__products-preHeader-item");
  const main__productsPreHeaderItemUpperItems = document.querySelectorAll(".main__products-preHeader-item-upperItem");
  main__productsPreHeaderItems.forEach((item) => {
    item.addEventListener("mouseover", () => {
      main__productsPreHeaderItemUpperItems.forEach((item2) => {
        item2.classList.remove("block");
      });
      item.querySelector(".main__products-preHeader-item-upperItem").classList.add("block");
    });
    window.addEventListener("mouseout", (e) => {
      if (!e.target.closest(".main__products-preHeader-item-upperItem")) {
        item.querySelector(".main__products-preHeader-item-upperItem").classList.remove("block");
      }
    });
  });
};

const preHeaderBtns = document.querySelectorAll(".main__products-preHeader-btn");
preHeaderBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const main__productsPreHeaderContainer = document.querySelector(".main__products-preHeader-container");
    let containerOffsetWidth = main__productsPreHeaderContainer.offsetWidth;
    if (e.target.closest(".main__products-preHeader-btn-prev")) {
      main__productsPreHeaderContainer.scrollLeft -= containerOffsetWidth - 150;
    } else if (e.target.closest(".main__products-preHeader-btn-next")) {
      main__productsPreHeaderContainer.scrollLeft += containerOffsetWidth - 150;
    }
  });
});

const skeletonPreHeader = () => {
  const main__productsPreHeaderContainer = document.querySelector(".main__products-preHeader-container");
  const html = `
  <div class="main__products-preHeader-item-skeleton">
    <div class="main__products-preHeader-item-image skeleton"></div>
    <div class="main__products-preHeader-item-info">
      <span class="main__products-preHeader-item-info-name skeleton" style="width: 100%"></span>
      <span class="main__products-preHeader-item-info-name skeleton" style="width: 75%"></span>
    </div>
  </div>`;
  for (let i = 0; i < 20; i++) {
    main__productsPreHeaderContainer.insertAdjacentHTML("beforeend", html);
  }
};
//ASIDE FILTER--------------->>//

let paramsGlobal = new URLSearchParams(window.location.search);
let slugUrlGlobal = paramsGlobal.get("slug-url");

const getAPIFilterCategories = async () => {
  const api_url = "https://sephora.p.rapidapi.com/categories/v2/list?number=1&size=100&country=SG&language=en-SG";
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getFilterCategories(data, slugUrlGlobal);
  } catch (err) {
    console.error(err);
  }
};

const asideHeaderText = document.querySelector(".aside-header-text");
const asideNavList = document.querySelector("[data-aside-nav-list]");
const getFilterCategories = (data, slugUrl) => {
  const dataAsideNavItemTemplate = document.querySelector("[data-aside-nav-item-template]");
  document.querySelector(".aside-nav-list-skeleton").remove();
  document.querySelector(".aside-header-text.skeleton").remove();
  let categoryChildsArray = [];
  data.data.forEach((category) => {
    if (category.attributes["slug-url"] == slugUrl) {
      asideHeaderText.textContent = category.attributes.label;
      categoryChildsArray.push(category.relationships.children.data);
    }
  });
  if (categoryChildsArray[0].length == 0) return;
  data.data.forEach((category) => {
    categoryChildsArray[0].forEach((categoryChild) => {
      if (categoryChild.id == category.id) {
        const item = dataAsideNavItemTemplate.content.cloneNode(true);
        const item_aLink = item.querySelector("[data-aside-nav-item-aLink]");

        item_aLink.textContent = category.attributes.label;
        item_aLink.href = `products.html?${getUrlSlugUrl(category.attributes["slug-url"])}`;

        asideNavList.append(item);
      }
    });
  });
};
const asideNav = document.querySelector(".aside-nav");
const asideHeader = document.querySelector(".aside-header");
const skeletonNavAside = () => {
  const html = `
  <ul class="aside-nav-list-skeleton">
    <li class="aside-nav-item skeleton"></li>
    <li class="aside-nav-item skeleton" style="width: 80%"></li>
    <li class="aside-nav-item skeleton" style="width: 65%"></li>
    <li class="aside-nav-item skeleton" style="width: 90%"></li>
    <li class="aside-nav-item skeleton" style="width: 85%"></li>
  </ul>`;
  asideNav.insertAdjacentHTML("beforeend", html);

  const html2 = `<div class="aside-header-text skeleton"></div>`;
  asideHeader.insertAdjacentHTML("beforeend", html2);
};

const getAPIFilters = async (slugUrl) => {
  const api_url = `https://sephora.p.rapidapi.com/products/v2/get-filters?root_category=${slugUrl}&country=SG&language=en-SG`;
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getFilters(data);
  } catch (err) {
    console.error(err);
  }
};
const getFilters = (data) => {
  const asideFilterContentSkeletonItems = document.querySelectorAll(".aside-filter-content.skeleton");
  asideFilterContentSkeletonItems.forEach((item) => item.remove());

  const asideFilterContainer = document.querySelector(".aside-filter");
  const dataAsideFilterContentTemplate = document.querySelector("[data-aside-filter-content-template]");

  data.included.forEach((dataFilterType) => {
    if (dataFilterType.type == "brands") {
      const dataAsideBrandsFieldset = document.querySelector("[data-aside-brands-fieldset]");
      const html = `
      <div class="aside-filter-content-dropdown-item brand" data-filter-value-id=${dataFilterType.id}>
        <input type="checkbox" id="${dataFilterType.id}" name="${dataFilterType.attributes["slug-url"]}">
        <label for="${dataFilterType.id}">${dataFilterType.attributes.name}</label>
      </div>`;
      dataAsideBrandsFieldset.insertAdjacentHTML("afterbegin", html);
    }
    if (dataFilterType.type == "filter-types") {
      let filterValueArray = [];

      const item = dataAsideFilterContentTemplate.content.cloneNode(true);
      const itemName = item.querySelector("[data-aside-filter-content-header-name]");
      const dataAsideFilterFieldset = item.querySelector("[data-aside-filter-fieldset]");

      itemName.textContent = dataFilterType.attributes.name;
      itemName.parentElement.dataset.filterTypeId = dataFilterType.id;

      filterValueArray.push(dataFilterType.relationships["filter-values"].data);

      filterValueArray[0].forEach((filterValue) => {
        data.included.forEach((dataFilterValue) => {
          if (filterValue.id == dataFilterValue.id && dataFilterValue.type == "filter-values") {
            const html = `
            <div class="aside-filter-content-dropdown-item" data-filter-value-id=${dataFilterValue.id}>
              <input type="checkbox" id="${dataFilterValue.id}" name="${dataFilterValue.attributes.value}">
              <label for="${dataFilterValue.id}">${dataFilterValue.attributes.value}</label>
            </div>`;
            dataAsideFilterFieldset.insertAdjacentHTML("afterbegin", html);
          }
        });
      });

      asideFilterContainer.append(item);
    }
  });
  const asideFilterContents = document.querySelectorAll(".aside-filter-content");
  asideFilterContents.forEach((content) => {
    content.querySelector(".aside-filter-content-header").addEventListener("click", () => {
      content.querySelector(".aside-filter-content-dropdown").classList.toggle("block");
    });
  });
  const asideFilterContentDropdownItems = document.querySelectorAll(".aside-filter-content-dropdown-item");

  asideFilterContentDropdownItems.forEach((item) => {
    item.addEventListener("change", (e) => {
      let filterTypeString = e.target
        .closest(".aside-filter-content")
        .querySelector(".aside-filter-content-header")
        .textContent.trim();
      let filterValueString = e.target
        .closest(".aside-filter-content-dropdown-item")
        .querySelector("label")
        .textContent.trim();

      let dataFilterTypeId = e.target.closest(".aside-filter-content").querySelector(".aside-filter-content-header")
        .dataset.filterTypeId;
      let dataFilterValueId = e.target.closest(".aside-filter-content-dropdown-item").dataset.filterValueId;

      let dataFilterType = `${dataFilterTypeId}_${dataFilterValueId}`;
      let isChecked = e.target.closest(".aside-filter-content-dropdown-item").querySelector("input").checked;
      if (isChecked) {
        item.style.backgroundColor = "#f1eeee";
        item
          .closest(".aside-filter-content")
          .querySelector(".aside-filter-content-header")
          .querySelector(".before")
          .classList.add("block");
      } else {
        item.style.backgroundColor = "transparent";
      }

      let params = new URLSearchParams(window.location.search);

      let extra = params.get("product_group=Extra");
      let dataGroup = e.target.closest(".aside-filter-content").dataset.group;
      switch (dataGroup) {
        case "extra":
          if (isChecked) {
            params.set(`product_group=${filterTypeString}`, dataFilterValueId);
            extra = dataFilterValueId;
          } else {
            params.delete(`product_group=${filterTypeString}`);
            extra = "";
          }
          break;
        case "brands":
          if (isChecked) {
            params.append(`brands=${filterTypeString}[${dataFilterValueId}]`, filterValueString);
          } else {
            params.delete(`brands=${filterTypeString}[${dataFilterValueId}]`);
          }
          break;
        case "filters":
          if (isChecked) {
            params.append(`filters=${filterTypeString}[${dataFilterType}]`, filterValueString);
          } else {
            params.delete(`filters=${filterTypeString}[${dataFilterType}]`);
          }
          break;
      }
      history.pushState("", "", `products.html?${params}`);

      document.querySelector(".aside-blocker").style.display = "block";

      const productItems = document.querySelectorAll(".product-item");
      productItems.forEach((item) => item.remove());

      let filterTypeArray = getFilterTypeArray();
      let brandsArray = getBrandsArray();
      let sortId = params.get("sort");

      let filtersObj = {
        filterTypes: filterTypeArray.join(","),
        brands: brandsArray.join(","),
        sort: sortId,
        ex: extra,
      };
      skeletonProduct(false);

      getAPIProducts(slugUrlGlobal, 1, filtersObj);
    });
  });
  asideFilterContents.forEach((content) => {
    let dataFilterTypeId = content.querySelector(".aside-filter-content-header").dataset.filterTypeId;
    const asideFilterContentDropdownItems = content.querySelectorAll(".aside-filter-content-dropdown-item");
    asideFilterContentDropdownItems.forEach((item) => {
      let params = new URLSearchParams(window.location.search);
      // extra
      let extraparam = params.get("product_group=Extra");
      let dataFilterValueId = item.dataset.filterValueId;
      if (extraparam == dataFilterValueId) {
        item.querySelector("input").checked = true;
        item
          .closest(".aside-filter-content")
          .querySelector(".aside-filter-content-header")
          .querySelector(".before")
          .classList.add("block");
      } else {
        item.style.backgroundColor = "transparent";
      }
      // filters
      let filterTypeId = `${dataFilterTypeId}_${dataFilterValueId}`;
      let filterTypeArray = getFilterTypeArray();
      if (filterTypeArray.includes(filterTypeId)) {
        item
          .closest(".aside-filter-content")
          .querySelector(".aside-filter-content-header")
          .querySelector(".before")
          .classList.add("block");
        item.querySelector("input").checked = true;
      }
      // brands
      let brandsArray = getBrandsArray();
      if (brandsArray.includes(item.dataset.filterValueId)) {
        item
          .closest(".aside-filter-content")
          .querySelector(".aside-filter-content-header")
          .querySelector(".before")
          .classList.add("block");
        item.querySelector("input").checked = true;
      }
    });
  });
};
const getFilterTypeArray = () => {
  let params = new URLSearchParams(window.location.search);
  let filterTypeArray = [];
  params.forEach((value, key) => {
    if (key.startsWith("filters=")) {
      let filterTypeId = key.substring(key.indexOf("[") + 1, key.lastIndexOf("]"));
      filterTypeArray.push(filterTypeId);
    }
  });
  return filterTypeArray;
};

const getBrandsArray = () => {
  let params = new URLSearchParams(window.location.search);
  let brandArray = [];
  params.forEach((value, key) => {
    if (key.startsWith("brands=")) {
      let brandId = key.substring(key.indexOf("[") + 1, key.lastIndexOf("]"));
      brandArray.push(brandId);
    }
  });
  return brandArray;
};

const productsHeaderSteps = document.querySelector(".products-header-steps");
const getProductsSteps = () => {
  if (slugUrlGlobal == null) return;
  slugUrlGlobal.split("/").forEach((slug) => {
    let urlSlug = slugUrlGlobal.substring(0, slugUrlGlobal.indexOf(slug) + slug.length);
    const html = `
    <div class="products-header-step">
      <a href="products.html?${getUrlSlugUrl(urlSlug)}">
        ${slug}
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </a>
    </div>`;
    productsHeaderSteps.insertAdjacentHTML("beforeend", html);
  });
  productsHeaderSteps.lastChild.querySelector("a").removeAttribute("href");
  productsHeaderSteps.lastChild.querySelector("ion-icon").remove();
};

const asideClearFiltersBtn = document.querySelector(".aside-clear-filters-btn");
asideClearFiltersBtn &&
  asideClearFiltersBtn.addEventListener("click", () => {
    const asideFilterContentDropdownItems = document.querySelectorAll(".aside-filter-content-dropdown-item");
    asideFilterContentDropdownItems.forEach((item) => {
      item.querySelector("input").checked = false;
      item
        .closest(".aside-filter-content")
        .querySelector(".aside-filter-content-header")
        .querySelector(".before")
        .classList.remove("block");
    });
    document.querySelector(".aside-blocker").style.display = "block";
    removeFilterUrlParams();
    removeFilterUrlParams();
    removeFilterUrlParams();

    const productItems = document.querySelectorAll(".product-item");
    productItems.forEach((item) => item.remove());

    let params = new URLSearchParams(window.location.search);
    let sortId = params.get("sort");

    let filtersObj = {
      filterTypes: [],
      brands: [],
      sort: sortId,
      ex: null,
    };
    getAPIProducts(slugUrlGlobal, 1, filtersObj);
    skeletonProduct(false);
  });

const brandsInput = document.querySelector(".brands-input");
brandsInput &&
  brandsInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const asideFilterContentDropdownBrandItems = document.querySelectorAll(".aside-filter-content-dropdown-item.brand");
    asideFilterContentDropdownBrandItems.forEach((brand) => {
      const isVisible = brand.querySelector("label").textContent.toLowerCase().includes(value.toLowerCase());
      brand.classList.toggle("hide", !isVisible);
    });
  });

const skeletonFIlter = () => {
  const asideFilter = document.querySelector(".aside-filter");
  const html = `<div class="aside-filter-content skeleton"></div>`;
  for (let i = 0; i < 8; i++) {
    asideFilter.insertAdjacentHTML("beforeend", html);
  }
};

//SORT--------------->>//
const main__productsHeaderSortDropdownItems = document.querySelectorAll(".main__products-header-sort-dropdown-item");
const main__productsHeaderSortCurrentSortSpan = document.querySelector(".main__products-header-sort-currentSort-span");
main__productsHeaderSortDropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    main__productsHeaderSortDropdown.classList.remove("block");
    main__productsHeaderSortCurrentSortSpan.textContent = item.textContent;
    document.querySelector(".aside-blocker").style.display = "block";

    const productItems = document.querySelectorAll(".product-item");
    productItems.forEach((item) => item.remove());

    let sortId = item.dataset.sort;
    updateUrlWithSort(sortId);

    let filterTypeArray = getFilterTypeArray();
    let brandsArray = getBrandsArray();
    let params = new URLSearchParams(window.location.search);
    let extra = params.get("product_group=Extra");

    let filtersObj = {
      filterTypes: filterTypeArray.join(","),
      brands: brandsArray.join(","),
      sort: sortId,
      ex: extra,
    };
    getAPIProducts(slugUrlGlobal, 1, filtersObj);
    skeletonProduct(false);
  });
});

const updateCurrentSort = () => {
  let params = new URLSearchParams(window.location.search);
  let currentUrlSort = params.get("sort");
  main__productsHeaderSortDropdownItems.forEach((item) => {
    if (currentUrlSort == item.dataset.sort) {
      main__productsHeaderSortCurrentSortSpan.textContent = item.textContent;
    }
  });
};
updateCurrentSort();

const updateUrlWithSort = (sortId) => {
  let params = new URLSearchParams(window.location.search);
  params.set("sort", sortId);
  history.pushState("", "", `products.html?${params}`);
};

//MAIN--------------->>//

const main__productsHeaderSortCurrentSort = document.querySelector(".main__products-header-sort-currentSort");
const main__productsHeaderSortDropdown = document.querySelector(".main__products-header-sort-dropdown");
main__productsHeaderSortCurrentSort &&
  main__productsHeaderSortCurrentSort.addEventListener("click", () => {
    main__productsHeaderSortDropdown.classList.toggle("block");
  });

let productPageNumber;
const getAPIProducts = async (slugUrl, pageNumber, filtersObj) => {
  productPageNumber = pageNumber;
  const api_url = `https://sephora.p.rapidapi.com/products/v2/list?number=${pageNumber}&size=30&country=SG&language=en-SG&filter_type=${filtersObj.filterTypes}&sort=${filtersObj.sort}&product_group=${filtersObj.ex}&brand=${filtersObj.brands}&root_category=${slugUrl}`;
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getProducts(data, pageNumber);
  } catch (err) {
    console.error(err);
  }
};

const getProducts = (data, pageNumber) => {
  const main__productsHeaderItemCount = document.querySelector(".main__products-header-itemCount");
  main__productsHeaderItemCount.textContent = `${data.meta["total-items"]} Items`;

  const dataProductsContainer = document.querySelector("[data-products-container]");
  const dataProductItemTemplate = document.querySelector("[data-product-item-template]");

  const productItemSkeleton = document.querySelectorAll(".product-item-skeleton");
  productItemSkeleton.forEach((skeleton) => {
    skeleton.remove();
  });
  if (pageNumber > data.meta["total-pages"]) {
    document.querySelector(".main__products-alert").classList.add("block");
    return;
  }
  if (data.meta["total-pages"] == 0) {
  }
  data.data.forEach((product) => {
    const item = dataProductItemTemplate.content.cloneNode(true);

    const itemId = item.querySelector("[data-product-item-id]");
    const itemImage = item.querySelector("[data-product-item-image]");
    const itemName = item.querySelector("[data-product-item-name]");
    const itemCapacity = item.querySelector("[data-product-item-capacity]");
    const itemRating = item.querySelector("[data-product-item-rating]");
    const itemRevies = item.querySelector("[data-product-revies]");
    const itemOriginalPrice = item.querySelector("[data-product-item-originalPrice]");
    const itemPrice = item.querySelector("[data-product-item-price]");

    let currentProductData = {
      id: product.id,
      name: product.attributes.name,
    };
    item.querySelector("a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

    itemId.textContent = product.id;
    itemImage.src = product.attributes["default-image-urls"][0];
    if (product.attributes["default-image-urls"].length > 1) {
      itemImage.setAttribute("onmouseover", `this.src='${product.attributes["default-image-urls"][1]}'`);
      itemImage.setAttribute("onmouseout", `this.src='${product.attributes["default-image-urls"][0]}'`);
    }
    itemName.textContent = product.attributes.name;
    if (product.attributes.heading == "" || product.attributes.heading == null) {
      item.querySelector(".product-item-info-header-capacity").style.display = "none";
    }
    if (!product.attributes["new-arrival"]) item.querySelector(".product-item-info-promo-na").style.display = "none";
    itemCapacity.textContent = product.attributes.heading;
    itemRating.textContent = product.attributes.rating;
    itemRevies.textContent = `(${product.attributes["reviews-count"]})`;
    if (product.attributes["under-sale"])
      itemOriginalPrice.textContent = convertPrice(product.attributes["original-price"]);
    itemPrice.textContent = convertPrice(product.attributes.price);

    dataProductsContainer.append(item);
  });
  document.querySelector(".aside-blocker").style.display = "none";
  if (pageNumber >= data.meta["total-pages"]) return;
  productObserver.observe(document.querySelector(".product-item.not-upper:last-child"));

  addToBasketPreFunction("products");
};

const productObserver = new IntersectionObserver((entries) => {
  const lastItem = entries[0];
  if (!lastItem.isIntersecting) return;

  productObserver.unobserve(lastItem.target);

  skeletonProduct(false);
  productPageNumber++;

  let filterTypeArray = getFilterTypeArray();
  let brandsArray = getBrandsArray();
  let params = new URLSearchParams(window.location.search);
  let sortId = params.get("sort");
  let extra = params.get("product_group=Extra");

  let filtersObj = {
    filterTypes: filterTypeArray.join(","),
    brands: brandsArray.join(","),
    sort: sortId,
    ex: extra,
  };
  getAPIProducts(slugUrlGlobal, productPageNumber, filtersObj);
});

const main__productsContainer = document.querySelector(".main__products-container");
const dataBestsellersProductList = document.querySelector("[data-bestsellers-product-list]");
const dataNewarrivalsProductList = document.querySelector("[data-newarrivals-product-list]");

const skeletonProduct = (isIndex) => {
  const html = `<div class="product-item-skeleton">
  <div class="product-item-header">
    <span class="product-item-header-id skeleton"></span>
  </div>
  <div class="product-item-image skeleton"></div>
  <div class="product-item-info">
    <span class="product-item-info-promo-na skeleton"></span>
    <div class="product-item-info-header">
      <span class="name skeleton" style="width: 100%"></span>
      <span class="name skeleton"  style="width: 75%"></span>
      <div class="product-item-info-header-capacity">
        <span class="capacity skeleton"></span>
      </div>
    </div>
    <div class="product-item-info-middle">
      <div class="product-item-info-middle-rating">
        <span class="rating skeleton"></span>
        <span class="revies-count skeleton"></span>
      </div>
      <div class="product-item-info-middle-price">
        <span class="original-price skeleton"></span>
        <span class="current-price skeleton"><sup-price></sup></span>
      </div>
    </div>
  </div>
</div>`;
  if (isIndex) {
    for (let i = 0; i < 12; i++) {
      dataBestsellersProductList.insertAdjacentHTML("beforeend", html);
      dataNewarrivalsProductList.insertAdjacentHTML("beforeend", html);
    }
  } else {
    for (let i = 0; i < 12; i++) {
      main__productsContainer.insertAdjacentHTML("beforeend", html);
    }
  }
};

const miniBannersBtns = document.querySelectorAll(".mini-banners-btn");
miniBannersBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const miniBannersContainer = document.querySelector(".mini-banners-container");
    let containerOffsetWidth = miniBannersContainer.offsetWidth;
    if (e.target.closest(".mini-banners-btn.prev")) {
      miniBannersContainer.scrollLeft -= containerOffsetWidth - 150;
    } else if (e.target.closest(".mini-banners-btn.next")) {
      miniBannersContainer.scrollLeft += containerOffsetWidth - 150;
    }
  });
});
//<<---------------PRODUCT.HTML--------------->>//

const getAPICurrentProduct = async (productId) => {
  const api_url = `https://sephora.p.rapidapi.com/products/v2/detail?id=${productId}&country=SG&language=en-SG`;
  try {
    const response = await fetch(api_url, options);
    const data = await response.json();
    getCurrentProduct(data);
  } catch (err) {
    console.error(err);
  }
};
const getCurrentProduct = (data1) => {
  const data = data1.data;
  const dataCurrentProduct = document.querySelector("[data-currentProduct]");
  const dataCurrentProductTemplate = document.querySelector("[data-currentProduct-template]");

  const item = dataCurrentProductTemplate.content;

  const itemMainImage = item.querySelector("[data-currentProduct-mainImage]");
  const itemGallery = item.querySelector("[data-currentProduct-gallery]");
  const itemId = item.querySelector("[data-currentProduct-id]");
  const itemBrand = item.querySelector("[data-currentProduct-brand]");
  const itemName = item.querySelector("[data-currentProduct-name]");
  const itemCapacity = item.querySelector("[data-currentProduct-capacity]");
  const itemRating = item.querySelector("[data-currentProduct-rating]");
  const itemRevies = item.querySelector("[data-currentProduct-revies]");
  const itemDesc = item.querySelector("[data-currentProduct-desc]");
  const itemPrice = item.querySelector("[data-currentProduct-price]");
  const itemOriginalPrice = item.querySelector("[data-currentProduct-originalPrice]");
  const itemSaleText = item.querySelector("[data-currentProduct-sale-text]");
  const itemBenefits = item.querySelector("[data-currentProduct-benefits]");

  const itemIngredients = document.querySelector("[data-currentProduct-ingredients]");
  const itemHowToText = document.querySelector("[data-currentProduct-how-to-text]");

  itemMainImage.src = data.attributes["closeup-image-urls"][0];

  for (let i = 0; i < data.attributes["cart-image-urls"].length; i++) {
    const html = `<div class="swiper-slide currentProduct-gallery-image">
    <img src="${data.attributes["cart-image-urls"][i]}" alt="cartImage">
    </div>`;

    itemGallery.insertAdjacentHTML("beforeend", html);
  }

  itemId.textContent = data.id;
  itemBrand.textContent = data.attributes["brand-name"];
  itemName.textContent = data.attributes.name;
  itemCapacity.textContent = data.attributes.heading;
  itemRating.textContent = data.attributes.rating;
  itemRevies.textContent = `(${data.attributes["reviews-count"]})`;
  itemDesc.innerHTML = data.attributes.description;
  if (data.attributes["new-arrival"]) item.querySelector(".currentProduct-info-header-flag").classList.add("block");
  if (data.attributes["under-sale"]) {
    itemSaleText.textContent = data.attributes["sale-text"];
    itemSaleText.classList.add("block");
    itemOriginalPrice.textContent = convertPrice(data.attributes["original-price"]);
  }
  itemPrice.textContent = convertPrice(data.attributes.price);
  itemBenefits.innerHTML = data.attributes.benefits;

  itemIngredients.innerHTML = data.attributes.ingredients;
  itemHowToText.innerHTML = data.attributes["how-to-text"];

  dataCurrentProduct.append(item);

  const currentProductGalleryImages = document.querySelectorAll(".currentProduct-gallery-image");
  currentProductGalleryImages.forEach((image, index) => {
    image.addEventListener("click", () => {
      currentProductGalleryImages.forEach((image, index) => {
        const styles = `
        border: 1px solid #d3d3d3;
        border-radius: 1rem;
        `;
        image.querySelector("img").style.cssText = styles;
      });

      document.querySelector("[data-currentproduct-mainimage]").src = data.attributes["closeup-image-urls"][index];

      const styles = `
      border: 2px solid #161a1d;
      border-radius: 1rem;
      `;
      image.querySelector("img").style.cssText = styles;
    });
  });

  addToBasketPreFunction("current");

  var swiper = new Swiper(".swiper", {
    slidesPerView: 3,
    direction: "vertical",
    spaceBetween: 24,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
};

//<<---------------BASKET--------------->>//

const addToBasketPreFunction = (page) => {
  const addToBasketBtns = document.querySelectorAll(".product-item-footer-basket-button");
  addToBasketBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switch (page) {
        case "index":
        case "products":
          addItemToBasket(e);
          break;
        case "current":
          addItemToBasketCurrent(e);
          break;
      }
    });
  });
};

const addItemToBasketCurrent = (event) => {
  const targetItem = event.target.closest(".currentProduct");
  const dropdownMainContainer = document.querySelector("[data-dropdown-main-container]");
  const dataDropdownMainItemTemplate = document.querySelector("[data-dropdown-main-item-template]");

  const item = dataDropdownMainItemTemplate.content.cloneNode(true);

  const itemImage = item.querySelector("[data-dropdown-main-image]");
  const itemBrand = item.querySelector("[data-dropdown-main-brand]");
  const itemName = item.querySelector("[data-dropdown-main-name]");
  const itemPrice = item.querySelector("[data-dropdown-main-price]");

  const itemId = targetItem.querySelector("[data-currentproduct-id]").textContent;

  if (checkIsAlreadyOnBasket(itemId)) return;

  item.querySelector(".dropdown-main-item").dataset.id = itemId;

  let currentProductData = {
    id: itemId,
    name: targetItem.querySelector(".name").textContent,
  };
  item.querySelector(".dropdown-main-item-info a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

  itemImage.src = targetItem.querySelector(".currentProduct-gallery-image img").src;
  itemBrand.textContent = targetItem.querySelector(".brand").textContent;
  itemName.textContent = targetItem.querySelector(".name").textContent;
  itemPrice.textContent = targetItem.querySelector(".price").textContent;

  dropdownMainContainer.append(item);

  let localStorageItem = {
    id: itemId,
    image: itemImage.src,
    brand: itemBrand.textContent,
    name: itemName.textContent,
    price: itemPrice.textContent,
    alink: `product.html?${getUrlSlugUrl("", currentProductData)}`,
  };
  addItemToLocalStorage(localStorageItem);
  updateBasketTotal();
  removeItemFromBasket("dropdown");
};

const addItemToBasket = (event) => {
  const targetItem = event.target.closest(".product-item");
  const dropdownMainContainer = document.querySelector("[data-dropdown-main-container]");
  const dataDropdownMainItemTemplate = document.querySelector("[data-dropdown-main-item-template]");

  const item = dataDropdownMainItemTemplate.content.cloneNode(true);

  const itemImage = item.querySelector("[data-dropdown-main-image]");
  const itemBrand = item.querySelector("[data-dropdown-main-brand]");
  const itemName = item.querySelector("[data-dropdown-main-name]");
  const itemPrice = item.querySelector("[data-dropdown-main-price]");

  const itemId = targetItem.querySelector(".product-item-header-id").textContent;

  if (checkIsAlreadyOnBasket(itemId)) return;

  item.querySelector(".dropdown-main-item").dataset.id = itemId;

  let currentProductData = {
    id: itemId,
    name: targetItem.querySelector(".name").textContent,
  };
  item.querySelector(".dropdown-main-item-info a").href = `product.html?${getUrlSlugUrl("", currentProductData)}`;

  itemImage.src = targetItem.querySelector(".product-item-image > img").src;
  itemName.textContent = targetItem.querySelector(".name").textContent;
  itemPrice.textContent = targetItem.querySelector(".current-price").textContent;

  dropdownMainContainer.append(item);

  let localStorageItem = {
    id: itemId,
    image: itemImage.src,
    brand: "",
    name: itemName.textContent,
    price: itemPrice.textContent,
    alink: `product.html?${getUrlSlugUrl("", currentProductData)}`,
  };
  addItemToLocalStorage(localStorageItem);
  updateBasketTotal();
  removeItemFromBasket("dropdown");

  document.querySelector(".header-main-rightside-basket-dropdown").classList.add("block");
};

const addItemToLocalStorage = (item) => {
  localStorage.setItem(`aybeauty-basketItem:${item.id}`, JSON.stringify(item));
  updateBasketWithLocalStorageItems("dropdown");
};

const updateBasketWithLocalStorageItems = (selector) => {
  document.querySelectorAll(`.${selector}-main-item`).forEach((item) => item.remove());
  let length = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("aybeauty-basketItem:")) {
      length += 1;
      let localItem = JSON.parse(localStorage.getItem(key));

      const mainContainer = document.querySelector(`[data-${selector}-main-container]`);
      const dataMainItemTemplate = document.querySelector(`[data-${selector}-main-item-template]`);

      const item = dataMainItemTemplate.content.cloneNode(true);

      const itemImage = item.querySelector(`[data-${selector}-main-image]`);
      const itemBrand = item.querySelector(`[data-${selector}-main-brand]`);
      const itemName = item.querySelector(`[data-${selector}-main-name]`);
      const itemPrice = item.querySelector(`[data-${selector}-main-price]`);

      item.querySelector(`.${selector}-main-item`).dataset.id = localItem.id;

      item.querySelector(`.${selector}-main-item-info a`).href = localItem.alink;

      itemImage.src = localItem.image;
      itemBrand.textContent = localItem.brand;
      itemName.textContent = localItem.name;
      itemPrice.textContent = localItem.price;

      mainContainer.append(item);
    }
  });
  const basketItemsPrices = document.querySelectorAll("[data-basket-main-price]");
  let prices = [];
  basketItemsPrices.forEach((price) => prices.push(parseInt(price.textContent.replace("$", ""))));
  let sum = prices.reduce((acc, curr) => curr + acc, 0).toFixed(2);
  if (document.body.id == "basket") {
    document.querySelector(".basket-header").textContent = `Get It Shipped (${length})`;
    document.querySelector(".footer-total-item-price").textContent = `$${sum}`;
    document.querySelector(".summary-header-item-price").textContent = `$${sum}`;
  }
  removeItemFromBasket(selector);
};

const updateBasketTotal = () => {
  const prices = document.querySelectorAll(".dropdown-main-item-price span");
  const itemsLength = document.querySelectorAll(".dropdown-main-item").length;
  let pricesArr = [];
  prices.forEach((price) => {
    pricesArr.push(parseInt(price.textContent.replace("$", "")));
  });
  let sum = pricesArr.reduce((acc, curr) => curr + acc);
  document.querySelector(".total-price").textContent = `$${sum.toFixed(2)}`;
  itemsLength > 1
    ? (document.querySelector(".total-item").textContent = `(${itemsLength} items)`)
    : (document.querySelector(".total-item").textContent = `(${itemsLength} item)`);
};

const checkIsAlreadyOnBasket = (id) => {
  const basketItems = document.querySelectorAll(".dropdown-main-item");
  let isTrue = false;
  basketItems.forEach((item) => {
    if (item.dataset.id == id) isTrue = true;
  });
  return isTrue;
};

const headerBasketBtn = document.querySelector(".header-main-rightside-basket");
headerBasketBtn.addEventListener("click", () => {
  if (document.body.id == "basket") return;
  document.querySelector(".header-main-rightside-basket-dropdown").classList.toggle("block");
  updateBasketWithLocalStorageItems("dropdown");
  updateBasketTotal();
});

const removeItemFromBasket = (selector) => {
  const removeBtns = document.querySelectorAll(`.${selector}-main-item-info-remove`);
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const closest = e.target.closest(`.${selector}-main-item`);
      const targetId = closest.dataset.id;
      const localStorageItemId = `aybeauty-basketItem:${targetId}`;
      localStorage.removeItem(localStorageItemId);
      closest.remove();

      updateBasketTotal();
    });
  });
};

document.querySelector(".dropdown-footer-button").addEventListener("click", () => {
  window.location.href = "basket.html";
});

// NAVIGATION MEDIA QUERIES

let mediaQuery = window.matchMedia("(max-width: 1000px)");
const showHideNav = (mediaQuery) => {
  if (mediaQuery.matches) {
    document.querySelector(".showHide-nav").classList.add("flex");
  } else {
    document.querySelector(".showHide-nav").classList.remove("flex");
    document.querySelector(".header-nav").classList.add("flex");
  }
};
mediaQuery.addListener(showHideNav);
showHideNav(mediaQuery);

document.querySelector(".showHide-nav").addEventListener("click", () => {
  document.querySelector(".header-nav").classList.toggle("flex");
});
//<<---------------SwitchFunctions--------------->>//

const switchFunctionsPerPage = () => {
  let pageId = document.body.id;
  switch (pageId) {
    case "index":
      getAPIBestsellers();
      getAPINewArrivals();
      skeletonProduct(true);
      break;
    case "products":
      let filterTypeArray = getFilterTypeArray();
      let brandsArray = getBrandsArray();
      let params = new URLSearchParams(window.location.search);
      let sortId = params.get("sort");
      let extra = params.get("product_group=Extra");
      let filtersObj = {
        filterTypes: filterTypeArray.join(","),
        brands: brandsArray.join(","),
        sort: sortId,
        ex: extra,
      };
      //getAPIProducts(slugUrlGlobal, 1, filtersObj);
      //getAPIPreHeaderProducts(slugUrlGlobal);
      getAPIFilters(slugUrlGlobal);
      //getAPIFilterCategories();
      skeletonNavAside();
      getProductsSteps();
      skeletonProduct(false);
      skeletonPreHeader();
      skeletonFIlter();
      break;
    case "product":
      getProductsSteps();
      let params1 = new URLSearchParams(window.location.search);
      let productUrl = params1.get("product");
      let productId = getCurrentProductUrlId(productUrl);
      getAPICurrentProduct(productId);
      break;
    case "basket":
      updateBasketWithLocalStorageItems("basket");
      break;
  }
};
switchFunctionsPerPage();
