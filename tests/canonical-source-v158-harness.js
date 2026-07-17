const fs = require('fs');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const index = fs.readFileSync('source/index.html', 'utf8');
const boot = fs.readFileSync('source/src/core/boot.js', 'utf8');
const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));

const match = /^(\d+)\.(\d+)\.(\d+)-dev$/.exec(version.version || '');
assert(match, 'Current development version is not a valid semantic dev checkpoint.');
const numericVersion = Number(match[1]) * 10000 + Number(match[2]) * 100 + Number(match[3]);
assert(numericVersion >= 10508, 'Canonical source architecture requires version 1.5.8-dev or later.');
assert(version.deploymentModel === 'canonical source plus transitional Git-managed overrides', 'Canonical source deployment model metadata changed unexpectedly.');
assert(index.includes('<title>Thousandfold Realms</title>'), 'Canonical page title is missing.');
assert(!index.includes('Brand Migration'), 'Legacy migration branding remains in source/index.html.');
assert(index.includes('id="tfBootScreen"'), 'Canonical boot shield is missing.');
assert(index.includes('id="tfTitleScreen"'), 'Current title screen is not baked into canonical HTML.');
assert(index.includes('class="tf-title-mode tf-booting"'), 'The page does not begin in protected boot mode.');
assert(index.includes('id="tfBackToTitle"'), 'Baked character creator lost its title-navigation control.');
assert(/<script src="src\/main\.js(?:\?v=\d+)?"><\/script><script src="src\/core\/boot\.js(?:\?v=\d+)?"><\/script>/.test(index), 'Boot release does not run after game bootstrap.');

assert(boot.includes("body.classList.remove('tf-booting')"), 'Boot controller never releases the protected page.');
assert(boot.includes("document.documentElement.dataset.tfReady = 'true'"), 'Boot controller does not publish readiness.');
assert(boot.includes("['tfTitleScreen', 'creator', 'gameScreen']"), 'Boot controller does not wait for a visible game screen.');
assert(!boot.includes('localStorage.clear'), 'Boot controller must not clear player saves.');

assert(workflow.includes('cp -a source/. _site/'), 'Pages is not assembled directly from source/.');
assert(!workflow.includes('unzip -q'), 'Pages still unzips a legacy package.');
assert(!workflow.includes('Thousandfold_Realms_Web_v1.4.4-dev.zip'), 'Pages still depends on the legacy ZIP.');
assert(workflow.includes("Path('_site/404.html').write_text(text"), 'Canonical deployment does not generate its 404 fallback.');
assert(workflow.includes('canonical-source-plus-transitional-overrides'), 'Deployment architecture metadata is missing.');
assert(workflow.includes('src/core/boot.js'), 'Deployment does not validate boot ordering.');

const mainIndex = index.search(/<script src="src\/main\.js(?:\?v=\d+)?"><\/script>/);
const bootIndex = index.search(/<script src="src\/core\/boot\.js(?:\?v=\d+)?"><\/script>/);
assert(mainIndex >= 0 && bootIndex > mainIndex, 'Canonical boot release must load after main.js.');

console.log(`Canonical source architecture harness passed at ${version.version}: direct source deployment, baked current title, protected boot, preserved saves, and no legacy ZIP dependency.`);
