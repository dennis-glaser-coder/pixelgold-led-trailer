from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace('.gallery-copy{padding:58px 18px 68px}.gallery-copy h2{font-size:56px}', '.gallery-copy{padding:50px 18px 30px}.gallery-copy .text-link{display:none}.gallery-copy h2{font-size:56px}')
s=s.replace('.contact-grid{grid-template-columns:1fr;gap:46px}.contact h2{font-size:59px}', '.contact{padding-top:42px}.contact-grid{grid-template-columns:1fr;gap:30px}.contact h2{font-size:52px}')
s=s.replace('@media(max-width:520px){.hero{min-height:620px}', '@media(max-width:520px){.gallery-copy{padding-bottom:22px}.contact{padding-top:34px}.contact h2{font-size:48px}.hero{min-height:620px}')
p.write_text(s)
