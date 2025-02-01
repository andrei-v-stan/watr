import { useState, useEffect } from 'react';
import Select from 'react-select';
import { querySPARQL, convertBindings } from '/src/utils/apiService';
import urls from '/src/config/urls.json';

function ExternalSection() {
  const [externalUrl, setExternalUrl] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [queryTitle, setQueryTitle] = useState('');
  const [autocompleteText, setAutocompleteText] = useState('');
  const [queryTitles, setQueryTitles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('html');

  useEffect(() => {
    const selectedUrl = urls.find(url => url.url === externalUrl);
    if (selectedUrl) {
      setQueryTitles(selectedUrl.queries);
      setQueryTitle('');
      setAutocompleteText('');
    } else {
      setQueryTitles([]);
      setQueryTitle('');
      setAutocompleteText('');
    }
  }, [externalUrl]);

  const handleQueryTitleChange = (selectedOption) => {
    setQueryTitle(selectedOption ? selectedOption.value : '');
    const selectedQuery = queryTitles.find(query => query.title === selectedOption?.value);
    setAutocompleteText(selectedQuery ? selectedQuery.query : '');
  };

  const handleQuery = async () => {
    const endpoint = externalUrl;
    const query = autocompleteText;

    const mimeTypeMapping = {
      'ttl': 'text/turtle',
      'jsonld': 'application/ld+json',
      'nq': 'application/n-quads',
      'nt': 'application/n-triples',
      'owl': 'application/rdf+xml',
      'pbrdf': 'application/pbrdf',
      'rdf': 'application/rdf+xml',
      'rj': 'application/rdf+xml',
      'rpb': 'application/rdf+xml',
      'rt': 'application/rdf+xml',
      'trdf': 'application/rdf+xml',
      'trig': 'application/trig',
      'trix': 'application/trix',
      'json': 'application/json',
      'html': 'application/html'
    };
  
    try {
      const data = await querySPARQL(endpoint, query);
      const htmlResponse = data.results.bindings;
      let datasetEndpoint;
      switch (endpoint) {
        case 'https://dbpedia.org/sparql':
          datasetEndpoint = 'dbpedia';
          break;
        case 'https://query.wikidata.org/sparql':
          datasetEndpoint = 'wikidata';
          break;
        default:
          datasetEndpoint = 'wikidata';
          break;
      }
            
      const convertData = convertBindings(selectedFormat, htmlResponse, datasetEndpoint);
      const blob = new Blob([convertData], { type: mimeTypeMapping[selectedFormat] || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparql_response.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error executing SPARQL query:', error);
    }
  };

  return (
    <div id="toggles-external-section">
      <Select
        className='external-select'
        options={urls.map((urlObj) => ({ value: urlObj.url, label: urlObj.url }))}
        onChange={(selectedOption) => setExternalUrl(selectedOption ? selectedOption.value : '')}
        placeholder="Select URL"
      />

      <Select
        className='external-select'
        options={queryTitles.map((query) => ({ value: query.title, label: query.title }))}
        onChange={handleQueryTitleChange}
        placeholder="Select Query Title"
        isDisabled={!externalUrl}
      />

      <Select
        className='external-select'
        options={[
          { value: 'ttl', label: 'TTL' },
          { value: 'jsonld', label: 'JSON-LD' },
          { value: 'nq', label: 'N-Quads' },
          { value: 'nt', label: 'N-Triples' },
          { value: 'owl', label: 'OWL' },
          { value: 'pbrdf', label: 'PBRDF' },
          { value: 'rdf', label: 'RDF' },
          { value: 'rj', label: 'RJ' },
          { value: 'rpb', label: 'RPB' },
          { value: 'rt', label: 'RT' },
          { value: 'trdf', label: 'TRDF' },
          { value: 'trig', label: 'TRIG' },
          { value: 'trix', label: 'TRIX' },
          { value: 'html', label: 'HTML' },
        ]}
        onChange={(selectedOption) => setSelectedFormat(selectedOption ? selectedOption.value : 'ttl')}
        placeholder="Select Format"
      />

      <textarea  
        type="text" 
        value={autocompleteText}  
        onChange={(e) => setAutocompleteText(e.target.value)}
        disabled={!externalUrl}
      />
      <br></br>
      <button 
        onClick={handleQuery} 
        disabled={!autocompleteText}
      >
        Send Query
      </button>
    </div>
  );
}

export default ExternalSection;