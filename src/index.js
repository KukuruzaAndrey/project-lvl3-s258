import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import './css/main.css';

const addedRSS = [];
const getTextFromTag = (dom, tag) => dom.querySelector(tag).textContent;
const renderChannelNode = (title, description) => {
  const node = document.createElement('li');
  node.classList.add('list-group-item');
  node.innerHTML = `<h5>${title}</h5>
                    <p class="mb-0">${description}</p>`;
  return node;
};
const renderArticleNode = (title, link) => {
  const node = document.createElement('li');
  node.classList.add('list-group-item');
  node.innerHTML = `<a href="${link}">${title}</a>`;
  return node;
};


document.addEventListener('DOMContentLoaded', () => {
  const RSSInput = document.querySelector('#input-rss');
  const addRSSButton = document.querySelector('#btn-add-rss');
  const invalidFeedback = document.querySelector('.invalid-feedback');
  const validFeedback = document.querySelector('.valid-feedback');
  const spinner = addRSSButton.querySelector('div');

  const state = {
    validForm: () => {
      RSSInput.classList.remove('is-invalid');
      RSSInput.classList.add('is-valid');
      addRSSButton.classList.remove('disabled');
      addRSSButton.classList.remove('avoid-clicks');
      validFeedback.textContent = 'Ready to add';
    },
    invalidForm: (msg) => {
      RSSInput.classList.remove('is-valid');
      RSSInput.classList.add('is-invalid');
      addRSSButton.classList.add('disabled');
      addRSSButton.classList.add('avoid-clicks');
      invalidFeedback.textContent = msg;
    },
    adding: () => {
      spinner.textContent = '';
      spinner.classList.add('loadersmall');
      RSSInput.setAttribute('disabled', undefined);
      addRSSButton.classList.add('avoid-clicks');
      addRSSButton.classList.add('disabled');
      validFeedback.textContent = 'Adding...';
    },
    added: () => {
      spinner.classList.remove('loadersmall');
      spinner.textContent = 'Add';
      RSSInput.removeAttribute('disabled');
      RSSInput.value = '';
      validFeedback.textContent = 'Added';
    },
    error: () => {
      addRSSButton.classList.remove('disabled');
      addRSSButton.classList.remove('avoid-clicks');
      spinner.classList.remove('loadersmall');
      spinner.textContent = 'Add';
      RSSInput.removeAttribute('disabled');
      RSSInput.classList.remove('is-valid');
      RSSInput.classList.add('is-invalid');
      invalidFeedback.textContent = 'Something went wrong. Please repeat later';
    },
  };

  RSSInput.addEventListener('input', (e) => {
    const validators = [{
      check: rss => isURL(rss),
      message: 'Not valid ULR',
    }, {
      check: rss => !addedRSS.includes(rss),
      message: 'This RSS already added',
    }];
    const validateResult = validators.reduce((acc, validator) => {
      if (!acc.isValidate) return acc;
      acc.isValidate = validator.check(e.target.value);
      acc.message = validator.message;
      return acc;
    }, { isValidate: true });

    if (validateResult.isValidate) {
      state.validForm();
    } else {
      state.invalidForm(validateResult.message);
    }
  });

  addRSSButton.addEventListener('click', () => {
    state.adding();
    axios.get(`https://cors-anywhere.herokuapp.com/${RSSInput.value}`)
      .then((response) => {
        addedRSS.push(RSSInput.value);
        state.added();
        const rssDOM = new DOMParser().parseFromString(response.data, 'application/xml');
        const channelNode = renderChannelNode(getTextFromTag(rssDOM, 'title'), getTextFromTag(rssDOM, 'description'));
        const channelsList = document.querySelector('#channelsList');
        channelsList.appendChild(channelNode);

        const articles = rssDOM.querySelectorAll('item');
        const articleListEl = document.querySelector('#articleList');
        articles.forEach((item) => {
          const article = renderArticleNode(getTextFromTag(item, 'title'), getTextFromTag(item, 'link'));
          articleListEl.appendChild(article);
        });
      })
      .catch(() => {
        state.error();
      });
  });
});
