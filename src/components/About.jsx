import '../styles/about.css';

export default function About() {


  return (
    <div id="about-section">
      <img src="/src/assets/logo_board.png" alt="Logo Board" id="logo-board"></img>
      <div id="about-content">
        <h2>About Watr</h2>
        <h3>Project proposal (<i>by <a href="https://profs.info.uaic.ro/sabin.buraga/">Prof. Sabin-Corneliu Buraga</a></i>) </h3>
        <blockquote cite="http://www.worldwildlife.org/who/index.html">
        Create a (micro-)service-based Web system able to efficiently perform various processing tasks regarding the meta-data available in RDFa and HTML5 microdata formats provided by the <a href="http://webdatacommons.org/" title="WDC RDFa, Microdata, Embedded JSON-LD, and Microformats Data Sets">Web Data Commons</a> – see also <a href="https://cdn.aaai.org/ojs/17816/17816-13-21310-1-2-20210518.pdf" title="Read the article (PDF)">Empirical Best Practices On Using Product-Specific Schema.org</a>. Using a modular approach, a minimal set of operations will be implemented: visualize, classify, compare, and match/align. The queries will be performed by invoking a SPARQL endpoint, the obtained results being available in HTML and JSON-LD formats. Various statistics, modeled with the <a href="https://www.w3.org/TR/vocab-data-cube/" title="Details about RDF Data Cube">RDF Data Cube</a> vocabulary, will be also exposed.
        </blockquote>
        <h3>Our project solution (<i>by <a href="https://github.com/andrei-v-stan">Bsc. Stan Andrei-Vlăduț</a> & <a href="https://github.com/andrei-dascalu3">Bsc. Dascălu Andrei</a></i>) </h3>
      </div>
    </div>
  );
}