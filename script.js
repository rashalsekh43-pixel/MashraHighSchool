document.addEventListener('DOMContentLoaded', () => {
  const renderQuickLinks = () => {
    const quickLinksParent = document.getElementById('quick-links');
    if (!quickLinksParent || !window.schoolData?.quickLinks) return;

    quickLinksParent.innerHTML = window.schoolData.quickLinks
      .map(
        (item) => `
          <a class="quick-card" href="${item.href}">
            <h4>${item.label}</h4>
            <p>${item.description}</p>
          </a>
        `
      )
      .join('');
  };

  const renderInfoTable = () => {
    const parent = document.getElementById('info-table');
    if (!parent || !window.schoolData?.infoTable) return;

    parent.innerHTML = window.schoolData.infoTable
      .map(
        (row) => `
          <div class="info-row">
            <span class="label">${row.label}</span>
            <span class="value">${row.value}</span>
          </div>
        `
      )
      .join('');
  };

  const renderAcademics = () => {
    const academics = window.schoolData?.academics;
    if (!academics) return;

    const classesOffered = document.getElementById('classes-offered');
    const mediumOfInstruction = document.getElementById('medium-of-instruction');
    const boardAffiliation = document.getElementById('board-affiliation');
    const subjectsList = document.getElementById('subjects-list');
    const examInfo = document.getElementById('exam-info');

    if (classesOffered) classesOffered.textContent = academics.classesOffered;
    if (mediumOfInstruction) mediumOfInstruction.textContent = academics.mediumOfInstruction;
    if (boardAffiliation) boardAffiliation.textContent = academics.boardAffiliation;
    if (subjectsList) {
      subjectsList.innerHTML = academics.subjects.map((item) => `<li>${item}</li>`).join('');
    }
    if (examInfo) examInfo.textContent = academics.examInfo;
  };

  const renderFacilities = () => {
    const parent = document.getElementById('facility-list');
    if (!parent || !window.schoolData?.facilities) return;

    parent.innerHTML = window.schoolData.facilities
      .map(
        (facility) => `
          <article class="facility-item">
            <div class="topline">
              <h4>${facility.name}</h4>
              <span class="status-badge">${facility.status}</span>
            </div>
            <p>${facility.note}</p>
          </article>
        `
      )
      .join('');
  };

  const renderNotices = () => {
    const list = document.getElementById('notices-list');
    const categorySelect = document.getElementById('notice-category');
    const searchInput = document.getElementById('notice-search');
    if (!list || !categorySelect || !searchInput) return;

    const loadNotices = async () => {
      list.textContent = 'Loading notices…';
      try {
        const response = await fetch('/api/notices');
        if (!response.ok) throw new Error('Notices could not be loaded.');
        const notices = await response.json();
        categorySelect.replaceChildren(new Option('All', 'All'));
        [...new Set(notices.map((notice) => notice.category))].forEach((category) => {
          categorySelect.add(new Option(category, category));
        });

        const applyFilters = () => {
      const activeCategory = categorySelect.value;
      const searchText = searchInput.value.trim().toLowerCase();

      const filtered = notices.filter((notice) => {
        const categoryMatch = activeCategory === 'All' || notice.category === activeCategory;
        const searchMatch =
          !searchText ||
          `${notice.title} ${notice.category}`.toLowerCase().includes(searchText);
        return categoryMatch && searchMatch;
      });

      if (!filtered.length) {
        list.textContent = '';
        const empty = document.createElement('div');
        empty.className = 'notice-empty';
        empty.textContent = notices.length ? 'No notices match your search.' : 'There are no published notices yet.';
        list.append(empty);
        return;
      }

          list.replaceChildren(...filtered.map((notice) => {
            const article = document.createElement('article');
            article.className = 'notice-item';
            const meta = document.createElement('div');
            meta.className = 'notice-meta';
            const category = document.createElement('span');
            category.className = 'notice-category';
            category.textContent = notice.category;
            const date = document.createElement('span');
            date.className = 'notice-date';
            date.textContent = new Date(`${notice.publicationDate}T00:00:00`).toLocaleDateString();
            meta.append(category, date);
            const title = document.createElement('h4');
            const link = document.createElement('a');
            link.href = `/notices?id=${encodeURIComponent(notice.id)}`;
            link.textContent = notice.title;
            title.append(link);
            const summary = document.createElement('p');
            summary.textContent = notice.content;
            article.append(meta, title, summary);
            return article;
          }));
        };

        searchInput.addEventListener('input', applyFilters);
        categorySelect.addEventListener('change', applyFilters);
        applyFilters();
      } catch (error) {
        list.textContent = 'Notices are temporarily unavailable. Please try again later.';
        console.error(error);
      }
    };
    loadNotices();
  };

  const renderGallery = () => {
    const parent = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    if (!parent || !window.schoolData?.gallery) return;

    parent.innerHTML = window.schoolData.gallery
      .map(
        (image) => `
          <button
            type="button"
            class="gallery-item"
            data-image="${image.src}"
            data-alt="${image.alt}"
            aria-label="Open ${image.title}"
            style="background-image: url('${image.src}');"
          >
            <span>${image.title}</span>
          </button>
        `
      )
      .join('');

    parent.querySelectorAll('.gallery-item').forEach((button) => {
      button.addEventListener('click', () => {
        const src = button.getAttribute('data-image');
        const alt = button.getAttribute('data-alt');
        if (!lightbox || !lightboxImage || !src) return;

        lightboxImage.src = src;
        lightboxImage.alt = alt || 'School gallery view';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    if (lightbox && lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
      });

      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
          lightbox.classList.remove('open');
          lightbox.setAttribute('aria-hidden', 'true');
        }
      });
    }
  };

  const setupMenuToggle = () => {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  };

  const setupActiveNavigation = () => {
    const navLinks = document.querySelectorAll('.main-nav a, .floating-dock a');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    const update = () => {
      let currentId = 'top';

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom >= 180) {
          currentId = section.id;
          break;
        }
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const isActive = href === `#${currentId}` || (currentId === 'top' && href === '#top');
        link.classList.toggle('active', isActive);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  renderQuickLinks();
  renderInfoTable();
  renderAcademics();
  renderFacilities();
  renderNotices();
  renderGallery();
  setupMenuToggle();
  setupActiveNavigation();
});
