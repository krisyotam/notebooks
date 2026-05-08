#include <stdio.h>
#include <string.h>

#define MAX_LINE 1024
#define MAX_ENTRIES 2048

typedef struct {
	char title[512];
	char date[11]; /* YYYY-MM-DD */
	char time[6];  /* HH:MM */
	int done;
} Entry;

static int
read_entries(const char *path, Entry *entries, int max)
{
	FILE *f = fopen(path, "r");
	if (!f) {
		fprintf(stderr, "converter: cannot open %s\n", path);
		return -1;
	}
	char line[MAX_LINE];
	int n = 0;
	while (fgets(line, sizeof(line), f) && n < max) {
		line[strcspn(line, "\r\n")] = 0;
		if (line[0] == 0)
			continue;
		/* format: [ ] YYYY-MM-DD HH:MM | Title  or  [+] YYYY-MM-DD HH:MM | Title */
		int done = -1;
		if (strncmp(line, "[+] ", 4) == 0)
			done = 1;
		else if (strncmp(line, "[ ] ", 4) == 0)
			done = 0;
		if (done < 0)
			continue;

		char *p = line + 4;
		/* parse date */
		if (strlen(p) < 16 || p[10] != ' ' || p[16] != ' ')
			continue;
		strncpy(entries[n].date, p, 10);
		entries[n].date[10] = 0;
		strncpy(entries[n].time, p + 11, 5);
		entries[n].time[5] = 0;

		/* skip " | " */
		char *bar = strstr(p + 16, "| ");
		if (!bar)
			continue;
		strncpy(entries[n].title, bar + 2, sizeof(entries[n].title) - 1);
		entries[n].title[sizeof(entries[n].title) - 1] = 0;
		entries[n].done = done;
		n++;
	}
	fclose(f);
	return n;
}

static void
html_escape(FILE *out, const char *s)
{
	for (; *s; s++) {
		switch (*s) {
		case '&': fputs("&amp;", out); break;
		case '<': fputs("&lt;", out); break;
		case '>': fputs("&gt;", out); break;
		case '"': fputs("&quot;", out); break;
		default:  fputc(*s, out); break;
		}
	}
}

/* format YYYY-MM-DD + HH:MM into YYYY.MM.DD, HH:MM */
static void
fmt_date(FILE *out, const char *date, const char *time)
{
	/* YYYY-MM-DD -> YYYY.MM.DD */
	fprintf(out, "%c%c%c%c.%c%c.%c%c, %s",
		date[0], date[1], date[2], date[3],
		date[5], date[6],
		date[8], date[9],
		time);
}

static const char *STATUS_EXPLANATION =
	"The status indicator reflects the current state of the work:\\n\\n"
	"- Abandoned: Work that has been discontinued\\n"
	"- Notes: Initial collections of thoughts and references\\n"
	"- Draft: Early structured version with a central thesis\\n"
	"- In Progress: Well-developed work actively being refined\\n"
	"- Finished: Completed work with no planned major changes\\n\\n"
	"This helps readers understand the maturity and completeness of the content.";

static const char *CERTAINTY_EXPLANATION =
	"The confidence tag expresses how well-supported the content is, or how likely "
	"its overall ideas are right. This uses a scale from &quot;impossible&quot; to "
	"&quot;certain&quot;, based on the Kesselman List of Estimative Words:\\n\\n"
	"1. &quot;certain&quot;\\n"
	"2. &quot;highly likely&quot;\\n"
	"3. &quot;likely&quot;\\n"
	"4. &quot;possible&quot;\\n"
	"5. &quot;unlikely&quot;\\n"
	"6. &quot;highly unlikely&quot;\\n"
	"7. &quot;remote&quot;\\n"
	"8. &quot;impossible&quot;";

static const char *IMPORTANCE_EXPLANATION =
	"The importance rating distinguishes between trivial topics and those which might "
	"change your life. Using a scale from 0-10, content is ranked based on its potential "
	"impact on:\\n\\n"
	"- the reader\\n"
	"- the intended audience\\n"
	"- the world at large";

static const char *INFO_SVG =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" "
	"stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" "
	"stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/>"
	"<path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>";

static int
write_page(const char *outpath, const char *slug, const char *title, const char *desc,
	Entry *entries, int n, const char *status, const char *certainty, int importance)
{
	FILE *f = fopen(outpath, "w");
	if (!f) {
		fprintf(stderr, "converter: cannot write %s\n", outpath);
		return -1;
	}

	int active = 0, done = 0;
	/* find earliest and latest dates */
	const char *first_date = NULL, *first_time = NULL;
	const char *last_date = NULL, *last_time = NULL;
	for (int i = 0; i < n; i++) {
		if (entries[i].done) done++;
		else active++;
		if (!first_date || strcmp(entries[i].date, first_date) < 0 ||
		    (strcmp(entries[i].date, first_date) == 0 && strcmp(entries[i].time, first_time) < 0)) {
			first_date = entries[i].date;
			first_time = entries[i].time;
		}
		if (!last_date || strcmp(entries[i].date, last_date) > 0 ||
		    (strcmp(entries[i].date, last_date) == 0 && strcmp(entries[i].time, last_time) > 0)) {
			last_date = entries[i].date;
			last_time = entries[i].time;
		}
	}

	fprintf(f,
		"<!DOCTYPE html>\n"
		"<html lang=\"en\">\n"
		"<head>\n"
		"  <meta charset=\"utf-8\">\n"
		"  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
		"  <meta name=\"description\" content=\"");
	html_escape(f, desc);
	fprintf(f, "\">\n"
		"  <meta name=\"author\" content=\"Kris Yotam\">\n"
		"  <link rel=\"canonical\" href=\"https://krisyotam.com/notebooks/%s\">\n"
		"  <meta property=\"og:title\" content=\"", slug);
	html_escape(f, title);
	fprintf(f, "\">\n"
		"  <meta property=\"og:description\" content=\"");
	html_escape(f, desc);
	fprintf(f, "\">\n"
		"  <meta property=\"og:url\" content=\"https://krisyotam.com/notebooks/%s\">\n"
		"  <meta property=\"og:type\" content=\"article\">\n"
		"  <meta property=\"og:site_name\" content=\"Kris's Notebooks\">\n"
		"  <meta name=\"twitter:card\" content=\"summary\">\n"
		"  <meta name=\"twitter:title\" content=\"", slug);
	html_escape(f, title);
	fprintf(f, "\">\n"
		"  <meta name=\"twitter:description\" content=\"");
	html_escape(f, desc);
	fprintf(f, "\">\n"
		"  <link href=\"/notebooks/style.css\" rel=\"stylesheet\">\n"
		"  <title>%s &mdash; Kris's Notebooks</title>\n"
		"</head>\n"
		"<body>\n\n", title);

	/* header card */
	fprintf(f,
		"<div class=\"nb-wrapper\">\n"
		"  <a class=\"nb-back\" href=\"/notebooks/\">\n"
		"    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\"\n"
		"      stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n"
		"      <path d=\"m15 18-6-6 6-6\"/>\n"
		"    </svg>\n"
		"    Return to Notebooks\n"
		"  </a>\n"
		"  <div class=\"nb-header\">\n"
		"    <h1 class=\"nb-header-title\">%s</h1>\n"
		"    <p class=\"nb-header-desc\">", title);
	html_escape(f, desc);
	fprintf(f, "</p>\n");

	/* dates */
	fprintf(f, "    <div class=\"nb-header-dates\">\n"
		"      <span>start: ");
	fmt_date(f, first_date, first_time);
	fprintf(f, "</span>\n"
		"      <span class=\"sep\">&middot;</span>\n"
		"      <span>end: ");
	fmt_date(f, last_date, last_time);
	fprintf(f, "</span>\n"
		"    </div>\n");

	/* meta: status, certainty, importance */
	fprintf(f,
		"    <div class=\"nb-meta\">\n"
		"      <span class=\"nb-meta-item meta-mid\">\n"
		"        %s\n"
		"        <span>status: %s</span>\n"
		"        <span class=\"nb-popover\"><h4>Status Indicator</h4><p>%s</p></span>\n"
		"      </span>\n"
		"      <span class=\"dot\">&middot;</span>\n"
		"      <span class=\"nb-meta-item meta-mid\">\n"
		"        %s\n"
		"        <span>certainty: %s</span>\n"
		"        <span class=\"nb-popover\"><h4>Confidence Rating</h4><p>%s</p></span>\n"
		"      </span>\n"
		"      <span class=\"dot\">&middot;</span>\n"
		"      <span class=\"nb-meta-item meta-mid\">\n"
		"        %s\n"
		"        <span>importance: %d/10</span>\n"
		"        <span class=\"nb-popover\"><h4>Importance Rating</h4><p>%s</p></span>\n"
		"      </span>\n"
		"    </div>\n",
		INFO_SVG, status, STATUS_EXPLANATION,
		INFO_SVG, certainty, CERTAINTY_EXPLANATION,
		INFO_SVG, importance, IMPORTANCE_EXPLANATION);

	fprintf(f,
		"    <hr class=\"nb-header-rule\">\n"
		"    <p style=\"text-align:center;font-family:serif;font-size:0.875rem;color:#666;margin:0.75rem 0 0;\">"
		"%d active &middot; %d done &middot; %d total</p>\n"
		"  </div>\n"
		"  <div class=\"nb-outer-rule\"></div>\n"
		"</div>\n\n", active, done, n);

	/* active entries */
	if (active > 0) {
		fprintf(f,
			"<div class=\"listing\" style=\"margin-bottom:0.3em;\">"
			"<div class=\"left\"><strong>Active</strong></div></div>\n");
		for (int i = 0; i < n; i++) {
			if (entries[i].done) continue;
			fprintf(f,
				"<div class=\"listing\"><div class=\"left\"><dl><dt>"
				"<span style=\"color:#999;font-family:'IBM Plex Mono',monospace;"
				"font-size:0.85em;\">[ ]</span> ");
			html_escape(f, entries[i].title);
			fprintf(f, " <i style=\"color:#999;font-size:0.85em;\">(");
			fmt_date(f, entries[i].date, entries[i].time);
			fprintf(f, ")</i>");
			fprintf(f, "</dt></dl></div></div>\n");
		}
	}

	/* separator */
	if (active > 0 && done > 0) {
		fprintf(f,
			"\n<div class=\"listing\"><div class=\"left\">"
			"<hr style=\"border:none;border-top:1px solid #e5e5e5;margin:1em 0;\">"
			"</div></div>\n\n");
	}

	/* done entries */
	if (done > 0) {
		fprintf(f,
			"<div class=\"listing\" style=\"margin-bottom:0.3em;\">"
			"<div class=\"left\"><strong>Done</strong></div></div>\n");
		for (int i = 0; i < n; i++) {
			if (!entries[i].done) continue;
			fprintf(f,
				"<div class=\"listing\"><div class=\"left\"><dl><dt>"
				"<span style=\"color:#999;font-family:'IBM Plex Mono',monospace;"
				"font-size:0.85em;\">[+]</span> "
				"<span style=\"color:#999;\">");
			html_escape(f, entries[i].title);
			fprintf(f, "</span> <i style=\"color:#bbb;font-size:0.85em;\">(");
			fmt_date(f, entries[i].date, entries[i].time);
			fprintf(f, ")</i>");
			fprintf(f, "</dt></dl></div></div>\n");
		}
	}

	/* footer */
	fprintf(f,
		"\n<div class=\"text\"><div class=\"left\">\n"
		"  <hr>\n"
		"  <p style=\"display:flex;justify-content:space-between\">\n"
		"    <a href=\"/notebooks/%s\">permanent link</a>\n"
		"    <cite><a href=\"/notebooks/\">Notebooks</a></cite>\n"
		"  </p>\n"
		"</div></div>\n\n", slug);

	fprintf(f, "</body>\n</html>\n");
	fclose(f);
	return 0;
}

int
main(void)
{
	Entry ideas[MAX_ENTRIES], questions[MAX_ENTRIES];

	int ni = read_entries("ideas.txt", ideas, MAX_ENTRIES);
	int nq = read_entries("questions.txt", questions, MAX_ENTRIES);

	if (ni < 0 || nq < 0)
		return 1;

	printf("ideas: %d entries\n", ni);
	printf("questions: %d entries\n", nq);

	if (write_page("build/ideas.html", "ideas", "The Idea Canon",
		"Topics queued for notebooks, ranked by interest.",
		ideas, ni, "In Progress", "likely", 8) < 0)
		return 1;
	if (write_page("build/questions.html", "questions", "Questions",
		"Open questions — the kind that don't have clean answers, only better framings.",
		questions, nq, "In Progress", "likely", 9) < 0)
		return 1;

	printf("wrote build/ideas.html\n");
	printf("wrote build/questions.html\n");
	return 0;
}
