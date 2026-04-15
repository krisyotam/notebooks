---
title: "Bradley-Terry Model"
description: "Notes on the Bradley-Terry model for ranking items via paired comparisons, its formula, and applications to personal preference ranking."
created: 2026-04-15T12:00pm
updated: 2026-04-15T12:00pm
status: "Notes"
certainty: "likely"
importance: 7
---

Recently I have been attempting to rank my favorite things, including films, anime, manga, directors, artists, and so on. The cognitive overhead for a task like this is immense. Rather than trying to assign arbitrary numbers to each item and refining them down to the tenth or hundredth manually to create separation within condensed tiers, I decided to consider ranking items via paired comparisons. There are a few options for this, such as [Elo](https://en.wikipedia.org/wiki/Elo_rating_system), [Copeland's method](https://en.wikipedia.org/wiki/Copeland%27s_method), [TrueSkill](https://en.wikipedia.org/wiki/TrueSkill), and of course the model I have landed on: the Bradley-Terry model.

A simple formula for determining which of two items $i$ or $j$ is more likely to be chosen between them. The probability $\Pr(i > j)$ that item $i$ is preferred over item $j$ is given by:

$$\Pr(i > j) = \frac{p_i}{p_i + p_j}$$

where $p_i$ and $p_j$ are positive real-valued parameters representing the "strength" or "merit" of items $i$ and $j$ respectively. The model assumes that each item $i$ in a set of $n$ items has an associated parameter $p_i > 0$, and that the outcome of any pairwise comparison depends only on the ratio $p_i / p_j$. Since only ratios matter, the parameters are identifiable only up to a multiplicative constant, so one typically normalizes by setting $\sum_{i=1}^{n} p_i = 1$ or fixing one parameter.

Given a dataset of paired comparison outcomes, the parameters $p_1, p_2, \ldots, p_n$ are estimated by maximum likelihood. If $w_{ij}$ denotes the number of times item $i$ was preferred over item $j$, the log-likelihood is:

$$\ell(p) = \sum_{i \neq j} w_{ij} \log \frac{p_i}{p_i + p_j}$$

This is a concave function in the log-transformed parameters $\lambda_i = \log p_i$, which guarantees a unique global maximum (up to the normalization constraint) whenever the comparison graph is connected.

## Recommended
- [Bradley-Terry model](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model), Wikipedia — a genuinely good overview for a simple topic

## To Read

### Primary Sources
- Bradley, R. A. & Terry, M. E., "Rank Analysis of Incomplete Block Designs: I. The Method of Paired Comparisons," *Biometrika* 39 (1952): 324-345

### Papers
- Hunter, D. R., "MM Algorithms for Generalized Bradley-Terry Models," *Annals of Statistics* 32 (2004): 384-406
