<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="fr-CA">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Plan du site — Chez Florent</title>
        <style>
          body { margin: 0; padding: 3rem 1.5rem; background: #00191E; color: #ECB989;
                 font-family: Georgia, 'Times New Roman', serif; }
          .wrap { max-width: 720px; margin: 0 auto; }
          h1 { font-size: 2rem; margin: 0 0 0.25rem; color: #ECB989; font-weight: 600; }
          .sub { color: rgba(236,185,137,0.65); font-style: italic; margin-bottom: 2.5rem; }
          .count { display: inline-block; margin-left: 0.5rem; font-size: 0.8rem;
                   font-family: Arial, sans-serif; color: #DE450F; }
          table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
          th { text-align: left; font-family: Arial, sans-serif; font-size: 0.7rem;
               letter-spacing: 0.15em; text-transform: uppercase;
               color: rgba(236,185,137,0.55); padding: 0 0.75rem 0.6rem 0;
               border-bottom: 1px solid rgba(236,185,137,0.25); }
          td { padding: 0.7rem 0.75rem 0.7rem 0; border-bottom: 1px solid rgba(236,185,137,0.12); }
          a { color: #ECB989; text-decoration: none; }
          a:hover { color: #DE450F; }
          .meta { font-family: Arial, sans-serif; font-size: 0.8rem;
                  color: rgba(236,185,137,0.55); white-space: nowrap; }
          .foot { margin-top: 2.5rem; font-size: 0.8rem; font-family: Arial, sans-serif;
                  color: rgba(236,185,137,0.45); }
          .foot a { color: rgba(236,185,137,0.7); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Chez Florent</h1>
          <p class="sub">
            Plan du site
            <span class="count"><xsl:value-of select="count(sm:urlset/sm:url)"/> pages</span>
          </p>
          <table>
            <tr>
              <th>Adresse</th>
              <th>Mise à jour</th>
              <th>Fréquence</th>
              <th>Priorité</th>
            </tr>
            <xsl:for-each select="sm:urlset/sm:url">
              <tr>
                <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                <td class="meta"><xsl:value-of select="sm:lastmod"/></td>
                <td class="meta"><xsl:value-of select="sm:changefreq"/></td>
                <td class="meta"><xsl:value-of select="sm:priority"/></td>
              </tr>
            </xsl:for-each>
          </table>
          <p class="foot">
            Ce fichier est un plan de site XML destiné aux moteurs de recherche.
            <a href="/">Retour à l'accueil</a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
