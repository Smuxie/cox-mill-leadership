# Student editor guide

Your advisor or website owner must first finish the one-time deployment setup
and invite your own GitHub account. You do not need Codex, ChatGPT, a code editor,
the owner's password, or a paid CMS account. Routine saves publish automatically.

## Sign in

1. Open the website and add `/admin/` to its address.
2. Select **Sign In with GitHub** and sign into your own invited account.
3. Approve the website's GitHub authentication app when prompted. The public
   repository permission allows you to save content. Ask your advisor if you
   do not recognize the app name.
4. If the page says account setup is needed, send that message to your advisor.
   The production editor has not been connected yet; no password can fix it.

Sign out when finished, especially on shared school computers. Never share your
GitHub password, recovery codes or authentication token. Use two-factor
authentication. The website never asks you to enter billing information.

## Add an event

1. Open **Events & archive**, then create an event.
2. Add the event title, description, date, location and category.
3. Enter start and end using Cox Mill local time. The editor uses Eastern time
   and handles daylight saving changes. Leave both blank if times are unknown;
   the event then remains upcoming through its date and moves to the archive at
   the next Eastern midnight. Do not invent times.
4. Start with **Visibility: draft**. Drafts are saved but stay off public pages.
5. Add an approved cover image and a description of what is pictured. Add extra
   photographs to the gallery, each with descriptive alternative text.
6. Add an optional existing school-approved registration or ticket link. The
   website itself does not process payments or collect student information.
7. Review the content, set visibility to **published**, and save. Wait for the
   website build before checking the public event page.

Featured adds a visible badge to the event card. Cancelled
marks the event as cancelled; update the description so students know what changed.

## Edit an event or add its recap

Open **Events & archive**, select the event, change the relevant fields, and save.
You can change the date, replace photographs, add a recap, enter verified attendance
or fundraising totals, and record results. Do not recreate old events each year.
The website places completed events in the archive automatically from their end
time and keeps their history. Dates and categories drive the archive filters.

Use Delete only when an entry truly should be removed. For a cancelled activity,
use cancelled visibility and explanatory text so its history is preserved.

## Upload photographs

Choose the image field's browse/upload option and select a JPG, PNG or WebP file.
Use only photos approved for school publication. Avoid private information in
images, captions, filenames or descriptions. The editor resizes photographs in
your browser and saves them in the GitHub repository. Files are limited to 2 MB;
compress or resize larger files. Do not upload videos, full-resolution albums or
other large files. Keep a separate school-approved archive of original photos.

Write alternative text describing the useful content, such as “Students cheering
from the gym bleachers.” Do not name individual students without permission.
Removing a photo from a page does not erase earlier Git history; tell your advisor
immediately if private content was uploaded.

## Announcements

Open **Announcements**, create or edit an entry, and add its title and message.
An optional HTTPS link can lead to approved details or a form. Set an expiration
using Eastern time to remove it from featured placement automatically. Enable
the featured switch and choose published visibility when ready. Save.
Only one active featured notice is displayed. Turn off the featured switch on
the previous notice when replacing it; if several are featured, the first by
filename is used. Expired notices are automatically skipped.

## Homepage, About and contact information

Open **Site settings** → **Homepage, about, contact & branding**. The introduction
section controls the hero headline, text, photograph and buttons. Other sections
control the mission, About page, school office details, participation text,
Instagram profile, footer and theme colors. Save your changes.

Use the school office or approved advisor contact details. Do not post a student's
email, phone number or private contact information. Theme colors affect the whole
site: keep readable contrast and ask an advisor before changing school branding.

## Instagram

The owner confirmed `https://www.instagram.com/coxmill_leadership/`, which is
already saved in Site settings. Ask your advisor before replacing that profile.

To feature a post, open **Instagram posts** → **Selected official posts**, add an
item, paste a public post or reel link (such as a URL ending in `/p/CODE/`), and
write a short caption. Pin the most useful posts if needed. Save.

Visitors choose whether to load Instagram content. Posts may not embed when
Instagram is blocked or a post has restrictions; visitors still have direct links.
The feed does not automatically discover new posts. Add new approved post URLs
when you want to feature them. No Instagram password or paid feed widget is used.

## Links, sign-up forms and people

Use **Quick links & forms** for approved HTTPS school resources and sign-up forms.
Use **People (permission required)** only after permission to publish names, roles,
biographies and photographs has been confirmed. This list starts empty.

## What Save does

Save writes a real commit to the website's GitHub repository. Cloudflare Pages
then builds and publishes the site. Updates are not instant; wait for a successful
build before checking the public page. Nobody needs to ask the owner to approve
each ordinary edit. Coordinate with other editors before changing the same entry.

If you are using **Work with Local Repository** on a developer's computer, saves
only change that computer's files. That is a separate development workflow and
does not publish online until Git changes are pushed. Student production editing
should use the GitHub sign-in method.

## Fix a mistake or get help

For a typo, reopen the entry, correct it and save again. For a deleted entry or
larger mistake, ask an advisor with repository access to restore an earlier Git
version or roll back the deployment. Every saved change has version history.

If an update does not appear, wait for the build and refresh the page. If it still
does not appear, tell your advisor the page address, the entry name, when you
saved, and the exact error message. Never send credentials. The advisor can check
Cloudflare's deployment log and the GitHub commit. If a free allowance has been
reached, wait or contact the owner; do not enable a paid plan.

Your first contact is the current Leadership advisor through the school office.
The owner and advisor should write their approved support route into the contact
page before student access begins.
