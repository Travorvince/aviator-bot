

\# Aviator Historical Data Analysis and Browser Automation



A JavaScript project that collects and analyzes historical Aviator game multiplier data using browser automation and statistical evaluation.



\## Project Overview



This project explores browser automation, CSV data handling, and historical performance evaluation.



It includes a Puppeteer-based browser automation component and an analysis module that evaluates historical multiplier outcomes against a 2.00x target.



\*\*Important:\*\* This project does not predict future Aviator outcomes or demonstrate a profitable betting strategy. Historical results do not establish future probabilities.



\## Features



\- Browser automation using Puppeteer.

\- Historical multiplier data collection and CSV storage.

\- CSV parsing and input validation.

\- Classification metrics calculation.

\- Comparison of historical majority, random baseline, and rolling-window approaches.

\- Automated tests using Node.js built-in test runner.



\## Technologies



\- JavaScript

\- Node.js

\- Puppeteer

\- CSV

\- Node.js Test Runner



\## Project Structure



```text

aviator-bot/

├── .gitignore

├── analysis-data.js

├── analysis-metrics.js

├── aviator-analysis.js

├── aviator-analysis.test.js

├── aviator-bot.js

├── aviator-results.csv

├── package.json

├── package-lock.json

└── README.md

```



\## Installation



Clone the repository:



```bash

git clone https://github.com/Travorvince/aviator-bot.git

cd aviator-bot

```



Install dependencies:



```bash

npm install

```



\## Running the Analysis



```bash

node aviator-analysis.js

```



\## Running Tests



```bash

npm test

```



\## Dataset Format



The historical dataset uses CSV format:



```csv

Round,Multiplier

1,12.35

2,1.24

3,2.30

```



The analysis currently uses a 2.00x threshold to classify outcomes.



\## Evaluation Metrics



The analysis reports:



\- Accuracy

\- Precision

\- Recall

\- F1 Score

\- Specificity

\- True positives

\- True negatives

\- False positives

\- False negatives



\## Limitations



\- Historical data cannot reliably predict future independent game outcomes.

\- The analysis is exploratory and is not financial or betting advice.

\- Browser automation may require adjustments if the target website changes.

\- Results depend on the quality and completeness of collected data.



\## Author



Vincent Kiprotich



