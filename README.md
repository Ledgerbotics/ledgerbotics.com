# LedgerBotics website — Global Accounting Support

Static website (plain HTML/CSS/JS, no build step needed). Upload the whole folder to the web root of www.ledgerbotics.com.

## Pages

| File | Page | SEO title |
|---|---|---|
| index.html | Home (both audiences) | LedgerBotics, Global Accounting Support for CPA Firms & Growing Businesses |
| for-cpa-firms.html | For CPA Firms | White-Label Accounting Support for CPA Firms, LedgerBotics |
| for-businesses.html | For Businesses | Outsourced Accounting Services for Growing Businesses, LedgerBotics |
| services.html | Services (CPA + business) | |
| pricing.html | CPA pricing (#cpa) and business custom pricing (#business) | |
| resources.html | Articles, scenarios, FAQ | |
| about.html | About, team, careers | |
| contact.html | Contact form | |

`sitemap.xml` and `robots.txt` are included. Submit the sitemap in Google Search Console after launch.

## Contact form setup (do this before launch)

The form submits directly from the page. It never opens Gmail, Outlook or any email app.

1. **Activate delivery to info@ledgerbotics.com (one time).** The default service is FormSubmit (free). After the site is live, submit one test inquiry from `contact.html`. FormSubmit emails an activation link to info@ledgerbotics.com. Click it once. Until it's activated the form shows an error message rather than a thank-you.
2. **Confirmation email to the visitor** is sent automatically (`autoResponse` in `assets/js/site.js`). Edit the wording there.
3. **CRM (optional).** In `assets/js/site.js`, fill in `FORM_CONFIG.hubspot.portalId` and `formGuid` to also create a contact in HubSpot. Or set `FORM_CONFIG.webhookUrl` to a Zapier / Make / Google Apps Script URL to store every lead in a sheet or other CRM.
4. **Own backend (optional).** To replace FormSubmit, change `FORM_CONFIG.endpoint`. It receives JSON and must return HTTP 2xx.
5. Test on mobile and desktop: submit, confirm the email arrives at info@ledgerbotics.com, and confirm the visitor receives the confirmation email.

Links can preselect form options, e.g. `contact.html?type=business&intent=assessment` or `contact.html?type=cpa&intent=pilot&plan=Dedicated%20Accounting%20Professional`.

## Editing content

- Page copy: edit the HTML files directly.
- Service detail pop-ups, articles, illustrative scenarios and FAQs: `assets/js/data.js`.
- Prices: `pricing.html` (each price has `data-us` and `data-ca` values).
- Priority industries (highlighted cards): the first four in the industries grids. Reorder them once campaign data shows which industries convert best.

## Brand assets (`assets/img/`)

- `ledgerbotics-logo.png`: header, light backgrounds
- `ledgerbotics-logo-white.png`: footer, dark backgrounds, dark slides
- `ledgerbotics-logo-full.png`: high resolution for proposals, presentations and email signatures
- `ledgerbotics-icon-512.png`: LinkedIn profile image / app icon
- `ledgerbotics-icon-180.png`, `ledgerbotics-icon-32.png`: favicons

Country flags are inline SVG, so they render identically on iPhone, Android, Windows and Mac.
