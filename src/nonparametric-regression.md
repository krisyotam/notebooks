---
title: "Nonparametric Regression"
created: 2026-04-04
updated: 2026-04-04
---

Methods for estimating regression functions without assuming a parametric form for the relationship between predictors and response. The function is estimated directly from data, with smoothness controlled by a bandwidth or tuning parameter rather than a fixed model. Covers kernel regression, local polynomial fitting, splines, and related approaches. Connects to [density-estimation](density-estimation) and [smoothing-splines](smoothing-splines).

## See Also

- [Density Estimation](density-estimation)
- [Gaussian Processes](gaussian-processes)

## Recommended

- Wand, M. P. and Jones, M. C. *Kernel Smoothing* (1995). The standard reference for kernel methods in regression and density estimation. Covers bandwidth selection, asymptotic theory, and multivariate extensions with clarity.
- Fan, J. and Gijbels, I. *Local Polynomial Modelling and Its Applications* (1996). Definitive treatment of local polynomial regression. Better boundary behavior than Nadaraya-Watson; explains why local linear is the right default.
- Green, P. J. and Silverman, B. W. *Nonparametric Regression and Generalized Linear Models: A Roughness Penalty Approach* (1994). Spline smoothing from a penalized likelihood perspective. Connects smoothing splines to reproducing kernel Hilbert spaces.
- Wasserman, L. *All of Nonparametric Statistics* (2006). Modern treatment with minimax theory, confidence bands, and connections to machine learning. Good on what is and isn't estimable.

## To Read

- Gyorfi, L., Kohler, M., Krzyzak, A., and Walk, H. *A Distribution-Free Theory of Nonparametric Regression* (2002). Comprehensive asymptotic theory without distributional assumptions. Dense but thorough.
- Tsybakov, A. B. *Introduction to Nonparametric Estimation* (2009). Minimax lower bounds and optimal rates. Essential for understanding fundamental limits.
- Hastie, T., Tibshirani, R., and Friedman, J. *The Elements of Statistical Learning* (2009). Chapters 5-6 give an accessible treatment of splines and kernel methods in the context of prediction.

## Questions

- What is the minimax optimal rate for estimating a smooth regression function in *d* dimensions, and how does the curse of dimensionality manifest in the bandwidth selection problem?
- When does local polynomial regression with degree *p* achieve better bias than Nadaraya-Watson at boundary points, and why does degree 1 suffice for most practical purposes?
- Under what conditions can a nonparametric regression estimator achieve parametric rates, and what does this imply about adaptive estimation over function classes?
