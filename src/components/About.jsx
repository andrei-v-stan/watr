import { useEffect, useState } from 'react';
import '../styles/about.css';

export default function About() {
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("visited")) {
      setFirstVisit(true);
      localStorage.setItem("visited", "true");
    }
  }, []);

  return (
    <div id="about-section" className={firstVisit ? "animate" : ""}>
      <img src="/src/assets/logo_board.png" alt="Logo Board" id="logo-board" className={firstVisit ? "animate" : ""}></img>
      <div id="about-content" className={firstVisit ? "animate" : ""}>
        <div id="about-first-line">
            <h2>About Watr</h2>
            <a href="http://jigsaw.w3.org/css-validator/check/referer" id='css-validator'>
              <img
                id='css-validator-image'
                src="http://jigsaw.w3.org/css-validator/images/vcss-blue"
                alt="Valid CSS!" />
            </a>
          </div>
        <h3>Project proposal (<i>by <a href="https://profs.info.uaic.ro/sabin.buraga/">Prof. Sabin-Corneliu Buraga</a></i>) </h3>
        <blockquote cite="http://www.worldwildlife.org/who/index.html">
        Create a (micro-)service-based Web system able to efficiently perform various processing tasks regarding the meta-data available in RDFa and HTML5 microdata formats provided by the <a href="http://webdatacommons.org/" title="WDC RDFa, Microdata, Embedded JSON-LD, and Microformats Data Sets">Web Data Commons</a> – see also <a href="https://cdn.aaai.org/ojs/17816/17816-13-21310-1-2-20210518.pdf" title="Read the article (PDF)">Empirical Best Practices On Using Product-Specific Schema.org</a>. Using a modular approach, a minimal set of operations will be implemented: visualize, classify, compare, and match/align. The queries will be performed by invoking a SPARQL endpoint, the obtained results being available in HTML and JSON-LD formats. Various statistics, modeled with the <a href="https://www.w3.org/TR/vocab-data-cube/" title="Details about RDF Data Cube">RDF Data Cube</a> vocabulary, will be also exposed.
        </blockquote>
        <h3>Our project solution (<i>by <a href="https://github.com/andrei-v-stan">Bsc. Stan Andrei-Vlăduț</a> & <a href="https://github.com/andrei-dascalu3">Bsc. Dascălu Andrei</a></i>) </h3>
        <div className="about-links">
          <h4><a href="https://github.com/andrei-v-stan/watr/blob/main/README.md">README</a></h4>
          <h4>|</h4>
          <h4><a href="https://raw.githack.com/andrei-v-stan/watr/main/documentation/Scholarly/index.html">Scholarly HTML</a></h4>
          <h4>|</h4>
          <h4><a href="https://raw.githubusercontent.com/andrei-v-stan/watr/main/documentation/Demo.mp4">Video Tutorial</a></h4>
        </div>
      </div>
    </div>
  );
}
