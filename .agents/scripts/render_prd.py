import fitz, os
src='attached_assets/Prd_NR-1_1787227095297.pdf'
out='.agents/outputs/prd-pages'
doc=fitz.open(src)
print('pages', doc.page_count)
for i,page in enumerate(doc):
    pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5), alpha=False)
    path=f'{out}/page-{i+1}.png'
    pix.save(path)
    print(path)
