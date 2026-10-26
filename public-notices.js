document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('public-notices-list');
  const message = document.getElementById('public-notices-message');
  const dialog = document.getElementById('notice-dialog');
  const close = document.getElementById('detail-close');
  const params = new URLSearchParams(window.location.search);

  const setNoticeDetail = (notice) => {
    document.getElementById('detail-title').textContent = notice.title;
    document.getElementById('detail-category').textContent = notice.category;
    document.getElementById('detail-date').textContent =
      new Date(`${notice.publicationDate}T00:00:00`).toLocaleDateString();
    document.getElementById('detail-content').textContent = notice.content;
    const attachment = document.getElementById('detail-attachment');
    attachment.hidden = !notice.attachmentName;
    if (notice.attachmentName) {
      attachment.href = `/api/notices/${encodeURIComponent(notice.id)}/attachment`;
      attachment.textContent = `Download PDF: ${notice.attachmentName}`;
    }
    if (!dialog.open) dialog.showModal();
  };

  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  try {
    const response = await fetch('/api/notices');
    if (!response.ok) throw new Error('Unable to load notices.');
    const notices = await response.json();
    if (!Array.isArray(notices)) throw new Error('Unexpected notices response.');
    message.hidden = notices.length > 0;
    if (!notices.length) {
      message.textContent = 'There are no published notices yet.';
      return;
    }

    list.replaceChildren(...notices.map((notice) => {
      const article = document.createElement('article');
      article.className = 'notice-item';
      const meta = document.createElement('div');
      meta.className = 'notice-meta';
      const category = document.createElement('span');
      category.className = 'notice-category';
      category.textContent = notice.category;
      const date = document.createElement('time');
      date.className = 'notice-date';
      date.dateTime = notice.publicationDate;
      date.textContent = new Date(`${notice.publicationDate}T00:00:00`).toLocaleDateString();
      meta.append(category, date);
      const title = document.createElement('h2');
      title.className = 'public-notice-title';
      const detailLink = document.createElement('a');
      detailLink.href = `/notices?id=${encodeURIComponent(notice.id)}`;
      detailLink.textContent = notice.title;
      detailLink.addEventListener('click', (event) => {
        event.preventDefault();
        history.replaceState(null, '', detailLink.href);
        setNoticeDetail(notice);
      });
      title.append(detailLink);
      const excerpt = document.createElement('p');
      excerpt.className = 'notice-excerpt';
      excerpt.textContent = notice.content.length > 240 ? `${notice.content.slice(0, 240)}…` : notice.content;
      const readMore = document.createElement('button');
      readMore.type = 'button';
      readMore.className = 'text-button';
      readMore.textContent = 'Read full notice';
      readMore.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('id', notice.id);
        history.replaceState(null, '', url);
        setNoticeDetail(notice);
      });
      article.append(meta, title, excerpt, readMore);
      if (notice.attachmentName) {
        const download = document.createElement('a');
        download.className = 'attachment-link';
        download.href = `/api/notices/${encodeURIComponent(notice.id)}/attachment`;
        download.textContent = `Download PDF: ${notice.attachmentName}`;
        article.append(download);
      }
      return article;
    }));

    const selectedId = params.get('id');
    if (selectedId) {
      const selected = notices.find((notice) => notice.id === selectedId);
      if (selected) setNoticeDetail(selected);
      else message.textContent = 'That notice is not available.';
    }
  } catch (error) {
    message.hidden = false;
    message.textContent = 'Notices are temporarily unavailable. Please try again later.';
    console.error(error);
  }
});
