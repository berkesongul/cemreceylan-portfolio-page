# Portfolio PDF Exporter

Figma sayfasındaki seçili veya aynı ölçüdeki üst seviye frame'leri tek, çok sayfalı PDF olarak dışa aktarır. Dosyalar bilgisayardan ayrılmaz; birleştirme plugin arayüzünde yerel olarak yapılır.

## Kurulum

```bash
cd figma-portfolio-exporter
npm install
npm run build
```

Figma Desktop'ta:

1. **Plugins → Development → Import plugin from manifest…** menüsünü aç.
2. Bu klasördeki `manifest.json` dosyasını seç.
3. Portfolyo kapağı gibi bir üst seviye frame seç.
4. Plugin'i çalıştır ve **Aynı ölçü** seçeneğini kullan.
5. Gerekirse sayfaları oklarla sırala, istemediklerini kapat ve **Tek PDF oluştur** düğmesine bas.

## Kapsamlar

- **Seçili:** Canvas'ta seçilen üst seviye frame'ler.
- **Aynı ölçü:** Seçili ilk frame ile aynı genişlik ve yükseklikteki tüm üst seviye frame'ler.
- **Tüm sayfa:** Mevcut sayfadaki bütün üst seviye frame, component ve section'lar.

Plugin harici ağ erişimi istemez.

Figma'nın PDF motorunun dışa aktaramadığı SVG/vector efektleriyle karşılaşılırsa plugin yalnızca sorunlu sayfayı yüksek çözünürlüklü PNG'ye dönüştürüp PDF'e ekler. Diğer sayfalar vector PDF olarak kalır.
