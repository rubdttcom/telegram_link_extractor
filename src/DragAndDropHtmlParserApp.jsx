import React, { useState } from 'react';

export default function DragAndDropHtmlParserApp() {
  const [links, setLinks] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState('');

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = Array.from(event.dataTransfer.files);
    const htmlFiles = files.filter(file => file.type === 'text/html');

    if (htmlFiles.length === 0) {
      alert('Please drop at least one valid HTML file.');
      return;
    }

    htmlFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const htmlString = e.target.result;
        parseHtml(htmlString);
      };
      reader.readAsText(file);
    });
  };

  const preprocessName = (name) => {
    const regex = / \d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/;
    const match = name.match(regex);
    if (match) {
      return name.slice(0, name.indexOf(match[0])).trim();
    }
    return name;
  };

  const parseHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    let lastFromName = '';
    const newLinks = [];

    const allElements = doc.body.querySelectorAll('*');

    allElements.forEach((el) => {
      if (el.classList.contains('from_name')) {
        lastFromName = preprocessName(el.textContent.trim());
      }
      if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) {
        const href = el.getAttribute('href');
        if (
          href &&
          href.trim() !== '' &&
          !href.startsWith('#go_to') &&
          !href.startsWith('https://t.me/') &&
          !href.startsWith('messages.html') &&
          !/^messages\d{1,2}\.html$/.test(href)
        ) {
          newLinks.push({
            from: lastFromName,
            href: href,
            text: el.textContent.trim(),
          });
        }
      }
    });

    setLinks((prevLinks) => [...prevLinks, ...newLinks]);
  };

  const uniqueSenders = Array.from(new Set(links.map(link => link.from || 'Unknown')));

  const filteredLinks = filter
    ? links.filter(link => link.from === filter)
    : links;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Link extractor from Telegram exports</h1>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 w-full max-w-xl text-center transition-all mb-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-lg">Drag and drop your .html files here</p>
        <p className="text-sm text-gray-500 mt-2">(You can upload multiple .html files)</p>
      </div>

      {links.length > 0 && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Links found</h2>

          <div className="mb-4">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by sender name:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              {uniqueSenders.map((sender, index) => (
                <option key={index} value={sender}>{sender}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 border">Sender</th>
                  <th className="text-left p-2 border">Link</th>
                  <th className="text-left p-2 border">Text</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{link.from || 'Unknown'}</td>
                    <td className="p-2 border text-blue-600 underline">
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.href}
                      </a>
                    </td>
                    <td className="p-2 border">{link.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
