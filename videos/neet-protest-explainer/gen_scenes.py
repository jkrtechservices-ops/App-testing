import json, os

BASE = os.path.dirname(os.path.abspath(__file__))

SCENES = [
    dict(id="s01", duration=6.88, image="photo.jpg", caption="Protesters at Jantar Mantar",
         kicker="NEWS EXPLAINER",
         headline="NEET PROTESTS ERUPT IN DELHI",
         subs=[(0.4, "A youth movement is growing at Jantar Mantar")]),
    dict(id="s02", duration=10.08, image="photo.jpg", caption="Students protest the NEET paper-leak controversy",
         kicker="NEWS EXPLAINER",
         headline="THE NEET PAPER-LEAK CONTROVERSY",
         subs=[(0.4, "Protesters say tensions escalated sharply around July 20")]),
    dict(id="s03", duration=8.23, image="photo.jpg", caption="Source: The Economic Times",
         kicker="NEWS EXPLAINER",
         headline="COCKROACH JANTA PARTY LEADS THE MOVEMENT",
         subs=[(0.4, "Abhijeet Dipke has emerged as the face of the protest")]),
    dict(id="s04", duration=5.65, image="photo.jpg", caption="Dharmendra Pradhan, Union Education Minister",
         kicker="NEWS EXPLAINER",
         headline="PROTESTERS’ DEMAND",
         subs=[(0.4, "Resignation of the Education Minister, and action on the exam-leak system")]),
    dict(id="s05", duration=7.44, image="photo.jpg", caption="Protesters march toward Parliament",
         kicker="NEWS EXPLAINER",
         headline="POLICE RESPONSE, PROTESTERS SAY",
         subs=[(0.4, "Tear gas and baton charges were reported as the march moved toward Parliament")]),
    dict(id="s06", duration=8.97, image=None,
         kicker="NEWS EXPLAINER",
         headline="SECURITY TIGHTENS",
         subs=[(0.4, "Internet restrictions followed"), (4.6, "Delhi University and JNU advised students to stay away")]),
    dict(id="s07", duration=11.75, image=None,
         kicker="NEWS EXPLAINER",
         headline="A 26-DAY HUNGER STRIKE ENDS",
         subs=[(0.4, "Sonam Wangchuk ended his fast after talks with officials"),
               (9.01, "But protesters say the fight isn’t over")]),
    dict(id="s08", duration=8.66, image=None,
         kicker="NEWS EXPLAINER",
         headline="POLITICAL REACTIONS",
         subs=[(0.4, "Rahul Gandhi reportedly criticized the university advisory"),
               (4.33, "Government sources: Pradhan’s resignation is “not on the table”")]),
    dict(id="s09", duration=7.72, image="photo.jpg", caption="Source: Times Now",
         kicker="NEWS EXPLAINER",
         headline="WHAT HAPPENS NEXT?",
         subs=[(0.4, "The question isn’t if the protest continues — it’s how much bigger it gets before the government responds")]),
]

CSS = """
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; font-family: 'Arial', 'Helvetica Neue', sans-serif; }
      body { background: #0b0d12; }
      #root { position: relative; width: 1080px; height: 1920px; }
      #three-layer { position: absolute; inset: 0; width: 100%; height: 100%; display: block; z-index: 0; }
      #photo-wrap { position: absolute; inset: 0; overflow: hidden; z-index: 1; }
      #photo { position: absolute; width: 118%; height: 118%; left: -9%; top: -9%; object-fit: cover; will-change: transform; }
      #scrim { position: absolute; inset: 0; z-index: 2;
        background: linear-gradient(180deg, rgba(11,13,18,0.55) 0%, rgba(11,13,18,0.15) 22%, rgba(11,13,18,0.35) 62%, rgba(11,13,18,0.94) 100%); }
      #scrim.text-only { background: linear-gradient(180deg, rgba(11,13,18,0.75) 0%, rgba(11,13,18,0.35) 45%, rgba(11,13,18,0.85) 100%); }
      #topstrip { position: absolute; top: 0; left: 0; right: 0; height: 210px; z-index: 3;
        background: linear-gradient(180deg, rgba(6,7,10,0.88) 0%, rgba(6,7,10,0.55) 70%, rgba(6,7,10,0) 100%); }
      #kicker { position: absolute; top: 96px; left: 56px; z-index: 4; display: flex; align-items: center; gap: 14px; opacity: 0; }
      #kicker .dot { width: 16px; height: 16px; border-radius: 50%; background: #e4372b; }
      #kicker .label { background: #e4372b; color: #fff; font-weight: 800; font-size: 30px; letter-spacing: 2px; padding: 8px 20px; border-radius: 6px; text-transform: uppercase; }
      #caption { position: absolute; top: 96px; right: 56px; z-index: 4; color: #cfd6e0; font-size: 24px; font-weight: 600;
        background: rgba(11,13,18,0.55); padding: 8px 18px; border-radius: 6px; opacity: 0; max-width: 420px; text-align: right; }
      #textblock { position: absolute; left: 56px; right: 56px; z-index: 4; }
      #textblock.bottom { bottom: 150px; }
      #textblock.center { top: 50%; transform: translateY(-50%); background: rgba(20,24,32,0.55);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 64px 44px; }
      #headline { color: #ffffff; font-size: 66px; font-weight: 900; line-height: 1.08; letter-spacing: -0.5px;
        text-shadow: 0 4px 18px rgba(0,0,0,0.55); opacity: 0; transform: translateY(30px); }
      .subline { color: #f2e9d8; font-size: 36px; font-weight: 600; line-height: 1.35; margin-top: 22px; opacity: 0;
        transform: translateY(18px); text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
      #barbottom { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; z-index: 5;
        background: linear-gradient(90deg, #e4372b 0%, #f2a93b 100%); opacity: 0; }
"""

def render_scene(sc):
    is_text_only = sc["image"] is None
    scrim_class = "text-only" if is_text_only else ""
    block_class = "center" if is_text_only else "bottom"
    photo_block = "" if is_text_only else '<div id="photo-wrap"><img id="photo" src="photo.jpg" /></div>'
    caption_block = f'<div id="caption">{sc["caption"]}</div>' if (not is_text_only and sc.get("caption")) else ""
    sub_divs = "\n        ".join(f'<div class="subline">{txt}</div>' for _, txt in sc["subs"])
    sub_starts = json.dumps([start for start, _ in sc["subs"]])

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>{CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{sc['duration']}" data-width="1080" data-height="1920" data-fps="30" data-no-timeline>
      <canvas id="three-layer"></canvas>
      {photo_block}
      <div id="scrim" class="{scrim_class}"></div>
      <div id="topstrip"></div>
      <div id="kicker"><div class="dot"></div><div class="label">{sc['kicker']}</div></div>
      {caption_block}
      <div id="textblock" class="{block_class}">
        <div id="headline">{sc['headline']}</div>
        {sub_divs}
      </div>
      <div id="barbottom"></div>
    </div>
    <script type="module">
      import * as THREE from "./three.module.min.js";
      import * as L from "./lib.js";
      try {{
        const W = 1080, H = 1920;
        const DUR = {sc['duration']};
        const canvas = document.getElementById("three-layer");
        const renderer = L.setupRenderer(canvas, W, H);
        const scene = new THREE.Scene();
        const camera = L.makeOrthoCamera(W, H);

        const isTextOnly = {"true" if is_text_only else "false"};
        const nodeField = L.makeNodeField({{ width: W, height: H, count: isTextOnly ? 42 : 18, seed: {hash(sc['id']) % 97} }});
        if (!isTextOnly) {{
          nodeField.children.forEach((c) => {{ if (c.material) c.material.opacity *= 0.35; }});
        }}
        scene.add(nodeField);
        const scan = L.makeScanline(W);
        scan.position.z = -0.2;
        scene.add(scan);

        const photo = document.getElementById("photo");
        const kicker = document.getElementById("kicker");
        const caption = document.getElementById("caption");
        const headline = document.getElementById("headline");
        const subs = Array.from(document.querySelectorAll(".subline"));
        const bar = document.getElementById("barbottom");

        function fadeUp(el, start, dur, time) {{
          const t = THREE.MathUtils.clamp((time - start) / dur, 0, 1);
          const e = 1 - Math.pow(1 - t, 3);
          el.style.opacity = e;
          el.style.transform = "translateY(" + (30 * (1 - e)) + "px)";
        }}
        function fadeIn(el, start, dur, time) {{
          const t = THREE.MathUtils.clamp((time - start) / dur, 0, 1);
          el.style.opacity = t;
        }}
        function fadeOutEnd(el, time, dur) {{
          const t = THREE.MathUtils.clamp((DUR - time) / dur, 0, 1);
          el.style.opacity = Math.min(parseFloat(el.style.opacity || "1"), t);
        }}

        const subStarts = {sub_starts};

        function renderAt(time) {{
          L.animateNodeField(nodeField, time);
          L.ambientDrift(camera, time, {{ ampX: 10, ampY: 6, freq: 0.1 }});
          scan.position.y = ((time * 60) % (H * 1.6)) - H * 0.8;
          scan.material.opacity = 0.10 + 0.05 * Math.sin(time * 2.3);

          if (photo) {{
            const p = time / DUR;
            const scale = 1.0 + p * 0.09;
            const panX = -2 + p * 4;
            photo.style.transform = "scale(" + scale + ") translateX(" + panX + "px)";
          }}

          fadeIn(kicker, 0.15, 0.5, time);
          if (caption) fadeIn(caption, 0.5, 0.5, time);
          fadeUp(headline, 0.35, 0.7, time);
          subs.forEach((el, i) => fadeUp(el, subStarts[i], 0.6, time));
          fadeIn(bar, 0.1, 0.4, time);

          fadeOutEnd(kicker, time, 0.4);
          if (caption) fadeOutEnd(caption, time, 0.4);
          fadeOutEnd(headline, time, 0.4);
          subs.forEach((el) => fadeOutEnd(el, time, 0.4));
          fadeOutEnd(bar, time, 0.4);

          renderer.render(scene, camera);
        }}
        window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
        renderAt(window.__hfThreeTime || 0);
      }} catch (err) {{
        const d = document.createElement("div");
        d.style.cssText = "position:absolute;inset:0;background:#fff;color:#c00;font:22px monospace;padding:20px;white-space:pre-wrap;z-index:999;";
        d.textContent = "ERROR: " + err.message + "\\n" + (err.stack || "");
        document.body.appendChild(d);
      }}
    </script>
  </body>
</html>
"""

for sc in SCENES:
    html = render_scene(sc)
    out_path = os.path.join(BASE, "scenes", sc["id"], "index.html")
    with open(out_path, "w") as f:
        f.write(html)
    print("wrote", out_path)
