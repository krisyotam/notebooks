#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_LINE 1024
#define MAX_ENTRIES 2048

typedef struct {
	char title[512];
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
		/* strip newline */
		line[strcspn(line, "\r\n")] = 0;
		/* skip blank lines */
		if (line[0] == 0)
			continue;
		/* parse [ ] or [+] prefix */
		if (strncmp(line, "[+] ", 4) == 0) {
			entries[n].done = 1;
			strncpy(entries[n].title, line + 4, sizeof(entries[n].title) - 1);
			n++;
		} else if (strncmp(line, "[ ] ", 4) == 0) {
			entries[n].done = 0;
			strncpy(entries[n].title, line + 4, sizeof(entries[n].title) - 1);
			n++;
		}
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

static int
write_page(const char *outpath, const char *title, Entry *entries, int n)
{
	FILE *f = fopen(outpath, "w");
	if (!f) {
		fprintf(stderr, "converter: cannot write %s\n", outpath);
		return -1;
	}

	int active = 0, done = 0;
	for (int i = 0; i < n; i++) {
		if (entries[i].done) done++;
		else active++;
	}

	fprintf(f,
		"<!DOCTYPE html>\n"
		"<html lang=\"en\">\n"
		"<head>\n"
		"  <meta charset=\"utf-8\">\n"
		"  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
		"  <meta name=\"description\" content=\"%s — Kris Yotam\">\n"
		"  <link href=\"style.css\" rel=\"stylesheet\">\n"
		"  <title>%s</title>\n"
		"</head>\n"
		"<body>\n\n", title, title);

	/* header card */
	fprintf(f,
		"<div class=\"nb-wrapper\">\n"
		"  <a class=\"nb-back\" href=\"/notebooks/\">\n"
		"    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\"\n"
		"      stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n"
		"      <path d=\"M19 12H5\"/><path d=\"M12 19l-7-7 7-7\"/>\n"
		"    </svg>\n"
		"    back to notebooks\n"
		"  </a>\n"
		"  <div class=\"nb-header\">\n"
		"    <h1 class=\"nb-header-title\">%s</h1>\n"
		"    <hr class=\"nb-header-rule\">\n"
		"    <p style=\"text-align:center;font-family:serif;font-size:0.875rem;color:#666;margin:0.75rem 0 0;\">"
		"%d active &middot; %d done &middot; %d total</p>\n"
		"  </div>\n"
		"</div>\n\n", title, active, done, n);

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
			fprintf(f, "</span></dt></dl></div></div>\n");
		}
	}

	fprintf(f, "\n</body>\n</html>\n");
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

	if (write_page("build/ideas.html", "Ideas", ideas, ni) < 0)
		return 1;
	if (write_page("build/questions.html", "Questions", questions, nq) < 0)
		return 1;

	printf("wrote build/ideas.html\n");
	printf("wrote build/questions.html\n");
	return 0;
}
