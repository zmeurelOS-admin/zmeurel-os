# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "🍓 Zmeurel OS" [level=1] [ref=e5]
      - paragraph [ref=e6]: Autentifică-te în contul tău
    - generic [ref=e7]:
      - generic [ref=e8]:
        - text: Email
        - textbox "Email" [ref=e9]:
          - /placeholder: email@exemplu.ro
          - text: user1@gmail.com
      - generic [ref=e10]:
        - text: Parolă
        - textbox "Parolă" [active] [ref=e11]:
          - /placeholder: ••••••••
          - text: test1234
      - button "Intră în cont" [ref=e12]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e18] [cursor=pointer]:
    - img [ref=e19]
  - alert [ref=e22]
```