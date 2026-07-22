# PrajaNeeti

### An open letter

To whoever is reading this,

I didn't start this project to gain something from a movement, or to speak for a cause I've only recently discovered. Over the years I've watched people protest for all kinds of reasons, from different sides of the political spectrum. My own involvement is nowhere near that of people who've spent years—or even their whole lives—staying politically engaged. I don't think I know more than they do. I just think I've noticed something worth trying to fix.

The pattern I keep seeing is simple. People ask for change because they genuinely want it. Then, before long, the conversation stops being about the problem and starts being about politics. The opposition wants to turn it into an issue against the government. The government wants to defend itself. Everyone argues over who should get blamed or who should get credit, and the original issue slowly fades into the background.

I don't think it has to work that way.

I think governments should be allowed to govern. At the same time, they should be answerable for what they promised and what they actually delivered. Those two things aren't opposites. Accountability doesn't have to mean constantly getting in the way. It can simply mean keeping an honest record that anyone can look at.

Most of us have worked under someone before. We know the difference between accountability and micromanagement. One helps people do their job better. The other just gets in the way. I don't want this project to become another source of noise. I want it to quietly keep track of whether the people we've elected are actually doing what they said they would, whoever they happen to be.

There's an idea in the *Bhagavad Gita* that I like. Krishna tells Arjuna that it's better to do your own dharma imperfectly than someone else's well. I'm not bringing it up as religious advice. I just think it's a good principle. I'd rather spend my time building something useful than arguing about who should build it. Some people are good at investigating. Some are good at organizing information. Some write. Some code. If everyone simply does their part, the result is usually better than another argument.

This project is for the uncle who comes home after work, watches the news and says, "Someone should do something." Here's one thing that can actually be done. It's for the person who voted for change and the person who voted for stability, and ended up disappointed either way. It's for people who don't feel represented by anyone. It's for people who've found ways around broken systems and slowly stopped noticing they're broken. And it's for people who never had those options to begin with.

Chanakya wrote something that stuck with me. In the *Chanakya Neeti*, he argues that the strength of a kingdom doesn't really come from its ruler. It comes from its people. If people are secure, prosperous and heard, the state remains stable even through weak leadership. If they aren't, no ruler stays strong for long. Whether or not you agree with everything he wrote, I think that idea still makes sense. A country works better when its citizens know what's happening and have a way to hold those in power accountable.

That's why I'm building **PrajaNeeti**.

The name comes from two simple ideas: *Praja*—the people—and *Neeti*—governance, policy, or the principles by which a state is run. The goal is straightforward: keep track of what's promised, what's completed and what's still pending in a way that's public and easy to verify. Not to campaign for a party. Not to attack one either. Just to keep a record that anyone can look at and make up their own mind.

It's open source because I don't want it to depend on me. One person can't track an entire country, and they shouldn't have to. If the project is useful, other people should be able to improve it, add data, verify information, build new features and take it further than I ever could alone.

If any of this makes sense to you—whether you're a developer, researcher, journalist, designer, someone who likes working with data, or just someone who wants to pay closer attention to your own city or state—I'd love your help.

Not another protest.

Not another political fight.

Just people doing the work.

---

## 🛠️ Data Sourcing & Scraper Architecture

PrajaNeeti includes an automated Python data ingestion suite located under `backend/app/scrapers/`.

### Run All Scrapers
```bash
cd backend
python -m app.scrapers.cli --target all
```

### Supported Data Targets
- `myneta`: Scrapes Lok Sabha candidate affidavits (assets, liabilities, criminal cases, education).
- `prs`: Scrapes MP legislative performance (attendance %, questions asked, debates, bills).
- `aob`: Parses Cabinet Secretariat Allocation of Business Rules PDF into department mandates.
- `ias`: Scrapes DoPT e-Civil List for senior IAS officer rosters and postings.
- `match`: Runs fuzzy string resolution to map raw posting titles to canonical department UUIDs.
- `mlalad`: Scrapes state-level assembly constituency allocation & expenditure (Gujarat pilot).
- `njdg`: Scrapes National Judicial Data Grid (NJDG) High Court case pendency and backlog stats.

### Tracking Progress
Track platform engineering and data ingestion milestones live on the web app at **`/milestones`** or in **`MILESTONES.md`**.
