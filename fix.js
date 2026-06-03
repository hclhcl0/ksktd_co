const fs = require('fs');
const path = require('path');

const functionsToAwait = [
  'getAllReports', 'getReportById', 'addReport', 'deleteReport', 'updateReport', 'getDashboardStats', 'getProgressDashboard',
  'getAccounts', 'addAccount', 'updateAccount', 'deleteAccount', 'updateAccountPassword', 'findAccountByUsername',
  'getVaccines', 'addVaccine', 'deleteVaccine',
  'getCampaigns', 'getCampaignById', 'addCampaign', 'updateCampaign', 'deleteCampaign',
  'getVaccinationReports', 'addVaccinationReport', 'updateVaccinationReport', 'deleteVaccinationReport'
];

const functionRegex = new RegExp(`(?<!await\\s)(${functionsToAwait.join('|')})\\(`, 'g');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(functionRegex, 'await $1(');
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(path.join(__dirname, 'app'));
walkDir(path.join(__dirname, 'components'));
