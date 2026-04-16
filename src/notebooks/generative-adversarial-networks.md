---
title: "Generative Adversarial Networks (GANs)"
description: "Notes on GANs, their minimax formulation, training instability, architectural evolution, and why diffusion models overtook them."
created: 2026-04-16T05:39pm
updated: 2026-04-16T05:39pm
status: "In Progress"
certainty: "likely"
importance: 6
---

GANs are a class of generative model. Ian Goodfellow and colleagues introduced them in 2014 with a simple idea: train two neural networks in opposition. A generator synthesizes data (images, audio, text) from noise. A discriminator learns to tell real samples from synthetic ones. Each network improves by exploiting the other's weaknesses. The generator wins when the discriminator can no longer tell real from fake. Goodfellow formalized this as a minimax game, with the Nash equilibrium, where the generator perfectly models the data distribution, as the theoretical optimum.

The intellectual genealogy is worth marking. GANs drew on adversarial examples (Szegedy et al., 2013) and game-theoretic learning, with a nod to the broader tradition of latent variable models including VAEs (Kingma & Welling, 2013, published the same year). What's genuinely new about GANs is that they replace an explicit likelihood function with an implicit one. You train a model without ever writing down $p(x)$. That made them far more flexible for high-dimensional perceptual data, and far harder to train.

The training dynamics are the central theoretical problem. The minimax objective is non-convex. Gradients can vanish when the discriminator dominates, and the generator can collapse to producing a narrow subset of outputs (mode collapse). The original formulation had no guarantee of convergence. Much of the subsequent literature, WGAN (Arjovsky et al., 2017), spectral normalization, progressive growing, etc., is best read as attempts to stabilize what is fundamentally a fragile adversarial equilibrium.

Architecturally the field moved fast. Fully connected networks gave way to convolutional ones (DCGAN, 2015), then conditional generation (cGAN, Pix2Pix, CycleGAN), then high-resolution synthesis (ProGAN, StyleGAN, BigGAN), and eventually hybrid approaches incorporating attention and transformers (VQGAN, GigaGAN). The image quality gains between 2016 and 2021 were among the most dramatic in deep learning's history. Early GAN faces are rough artifacts. StyleGAN2 faces are indistinguishable from photographs to the untrained eye.

A few deep tensions run through all of this. Evaluation is unsolved: metrics like FID (Fréchet Inception Distance) and Inception Score are imperfect proxies for the three things you actually want a generative model to do well, namely perceptual quality, memorization, and diversity. The Nash equilibrium framing may also be misleading in practice. The game is non-convex, and what training actually achieves may have little formal relationship to the minimax optimum. GANs have also largely ceded ground to diffusion models (DDPM, 2020; Stable Diffusion, 2022) on image synthesis benchmarks, a development that raises genuinely interesting questions about why an implicit likelihood model lost to an explicit one.

Adjacent intellectual territory worth engaging with: game theory (Nash equilibria, mechanism design), information geometry (the GAN objective can be reframed as minimizing certain divergences between distributions), optimal transport (WGAN's Wasserstein distance formulation), and the ethics of synthetic media. Deepfakes came directly out of GAN capabilities and remain a live policy problem.

## See Also
- Variational Autoencoders (VAEs) (placeholder)
- Diffusion Models (placeholder)
- Deepfakes (placeholder)

## Notes
-

## To Read

### Primary Sources
- Goodfellow, Ian et al., "Generative Adversarial Nets," *Advances in Neural Information Processing Systems* 27 (NeurIPS, 2014)
- Radford, Alec, Luke Metz & Soumith Chintala, "Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks," arXiv:1511.06434 (2015)
- Arjovsky, Martin, Soumith Chintala & Léon Bottou, "Wasserstein GAN," arXiv:1701.04862 (2017)
- Karras, Tero et al., "Progressive Growing of GANs for Improved Quality, Stability, and Variation," *ICLR* (2018), arXiv:1710.10196
- Karras, Tero et al., "A Style-Based Generator Architecture for Generative Adversarial Networks," *CVPR* (2019), arXiv:1812.04948
- Karras, Tero et al., "Analyzing and Improving the Image Quality of StyleGAN," arXiv:1912.04958 (2020)
- Brock, Andrew et al., "Large Scale GAN Training for High Fidelity Natural Image Synthesis," arXiv:1809.11096 (2018)
- Isola, Phillip et al., "Image-to-Image Translation with Conditional Adversarial Networks," *CVPR* (2017)
- Zhu, Jun-Yan et al., "Unpaired Image-to-Image Translation using Cycle-Consistent Adversarial Networks," *ICCV* (2017)

### Papers
- Arjovsky, Martin & Léon Bottou, "Towards Principled Methods for Training Generative Adversarial Networks," arXiv:1701.04862 (2017)
- Salimans, Tim et al., "Improved Techniques for Training GANs," *NeurIPS* (2016)
- Miyato, Takeru et al., "Spectral Normalization for Generative Adversarial Networks," *ICLR* (2018)
- Heusel, Martin et al., "GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium," *NeurIPS* (2017)
- Mescheder, Lars, Andreas Geiger & Sebastian Nowozin, "Which Training Methods for GANs do actually Converge?," *ICML* (2018)
- Lucic, Mario et al., "Are GANs Created Equal? A Large-Scale Study," *NeurIPS* (2018)
- Borji, Ali, "Pros and Cons of GAN Evaluation Measures," *Computer Vision and Image Understanding* (2019)
- Ho, Jonathan et al., "Denoising Diffusion Probabilistic Models," *NeurIPS* (2020)
- Dhariwal, Prafulla & Alex Nichol, "Diffusion Models Beat GANs on Image Synthesis," *NeurIPS* (2021)

### Tutorials & Survey
- Goodfellow, Ian, *NIPS 2016 Tutorial: Generative Adversarial Networks*, arXiv:1701.00160 (2016)
