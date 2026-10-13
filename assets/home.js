/* ==========================================================
   AK Explained — landing page behaviour
   1. Today in Literary History   2. Animated opening line
   3. Site search                 4. Sidebar menu toggle
   ========================================================== */
(function () {
  'use strict';

  const bdayEvents = [
    { m: 1, d: 1, kind: 'born', name: 'E. M. Forster', year: '1879' },
    { m: 1, d: 3, kind: 'born', name: 'J. R. R. Tolkien', year: '1892' },
    { m: 1, d: 6, kind: 'born', name: 'Kahlil Gibran', year: '1883' },
    { m: 1, d: 9, kind: 'born', name: 'Simone de Beauvoir', year: '1908' },
    { m: 1, d: 12, kind: 'born', name: 'Jack London', year: '1876' },
    { m: 1, d: 18, kind: 'born', name: 'A. A. Milne', year: '1882' },
    { m: 1, d: 19, kind: 'born', name: 'Edgar Allan Poe', year: '1809' },
    { m: 1, d: 22, kind: 'born', name: 'Lord Byron', year: '1788' },
    { m: 1, d: 25, kind: 'born', name: 'Virginia Woolf', year: '1882' },
    { m: 1, d: 27, kind: 'born', name: 'Lewis Carroll', year: '1832' },
    { m: 2, d: 2, kind: 'born', name: 'James Joyce', year: '1882' },
    { m: 2, d: 7, kind: 'born', name: 'Charles Dickens', year: '1812' },
    { m: 2, d: 8, kind: 'born', name: 'John Ruskin', year: '1819' },
    { m: 2, d: 10, kind: 'born', name: 'Charles Lamb', year: '1775' },
    { m: 2, d: 21, kind: 'born', name: 'W. H. Auden', year: '1907' },
    { m: 2, d: 23, kind: 'died', name: 'John Keats', year: '1821' },
    { m: 2, d: 26, kind: 'born', name: 'Victor Hugo', year: '1802' },
    { m: 2, d: 27, kind: 'born', name: 'John Steinbeck', year: '1902' },
    { m: 3, d: 6, kind: 'born', name: 'Elizabeth Barrett Browning', year: '1806' },
    { m: 3, d: 20, kind: 'born', name: 'Henrik Ibsen', year: '1828' },
    { m: 3, d: 26, kind: 'born', name: 'Robert Frost', year: '1874' },
    { m: 3, d: 28, kind: 'born', name: 'Maxim Gorky', year: '1868' },
    { m: 3, d: 31, kind: 'born', name: 'Andrew Marvell', year: '1621' },
    { m: 4, d: 2, kind: 'born', name: 'Hans Christian Andersen', year: '1805' },
    { m: 4, d: 4, kind: 'born', name: 'Maya Angelou', year: '1928' },
    { m: 4, d: 7, kind: 'born', name: 'William Wordsworth', year: '1770' },
    { m: 4, d: 13, kind: 'born', name: 'Samuel Beckett', year: '1906' },
    { m: 4, d: 15, kind: 'born', name: 'Henry James', year: '1843' },
    { m: 4, d: 21, kind: 'born', name: 'Charlotte Brontë', year: '1816' },
    { m: 4, d: 22, kind: 'born', name: 'Henry Fielding', year: '1707' },
    { m: 4, d: 23, kind: 'born', name: 'William Shakespeare', year: '1564 · d. 1616' },
    { m: 4, d: 24, kind: 'born', name: 'Anthony Trollope', year: '1815' },
    { m: 4, d: 28, kind: 'born', name: 'Harper Lee', year: '1926' },
    { m: 5, d: 7, kind: 'born', name: 'Rabindranath Tagore', year: '1861' },
    { m: 5, d: 9, kind: 'born', name: 'J. M. Barrie', year: '1860' },
    { m: 5, d: 12, kind: 'born', name: 'Dante Gabriel Rossetti', year: '1828' },
    { m: 5, d: 19, kind: 'died', name: 'Nathaniel Hawthorne', year: '1864' },
    { m: 5, d: 21, kind: 'born', name: 'Alexander Pope', year: '1688' },
    { m: 5, d: 22, kind: 'born', name: 'Arthur Conan Doyle', year: '1859' },
    { m: 5, d: 25, kind: 'born', name: 'Ralph Waldo Emerson', year: '1803' },
    { m: 5, d: 31, kind: 'born', name: 'Walt Whitman', year: '1819' },
    { m: 6, d: 2, kind: 'born', name: 'Thomas Hardy', year: '1840' },
    { m: 6, d: 5, kind: 'born', name: 'Federico García Lorca', year: '1898' },
    { m: 6, d: 9, kind: 'died', name: 'Charles Dickens', year: '1870' },
    { m: 6, d: 13, kind: 'born', name: 'W. B. Yeats', year: '1865' },
    { m: 6, d: 14, kind: 'born', name: 'Harriet Beecher Stowe', year: '1811' },
    { m: 6, d: 19, kind: 'born', name: 'Salman Rushdie', year: '1947' },
    { m: 6, d: 21, kind: 'born', name: 'Jean-Paul Sartre', year: '1905' },
    { m: 6, d: 25, kind: 'born', name: 'George Orwell', year: '1903' },
    { m: 6, d: 28, kind: 'born', name: 'Luigi Pirandello', year: '1867' },
    { m: 7, d: 3, kind: 'born', name: 'Franz Kafka', year: '1883' },
    { m: 7, d: 4, kind: 'born', name: 'Nathaniel Hawthorne', year: '1804' },
    { m: 7, d: 10, kind: 'born', name: 'Marcel Proust', year: '1871' },
    { m: 7, d: 12, kind: 'born', name: 'Henry David Thoreau', year: '1817' },
    { m: 7, d: 18, kind: 'died', name: 'Jane Austen', year: '1817' },
    { m: 7, d: 21, kind: 'born', name: 'Ernest Hemingway', year: '1899' },
    { m: 7, d: 26, kind: 'born', name: 'George Bernard Shaw', year: '1856' },
    { m: 7, d: 28, kind: 'born', name: 'Gerard Manley Hopkins', year: '1844' },
    { m: 7, d: 30, kind: 'born', name: 'Emily Brontë', year: '1818' },
    { m: 8, d: 1, kind: 'born', name: 'Herman Melville', year: '1819' },
    { m: 8, d: 4, kind: 'born', name: 'P. B. Shelley', year: '1792' },
    { m: 8, d: 6, kind: 'born', name: 'Alfred, Lord Tennyson', year: '1809' },
    { m: 8, d: 15, kind: 'born', name: 'Sir Walter Scott', year: '1771' },
    { m: 8, d: 24, kind: 'born', name: 'Jorge Luis Borges', year: '1899' },
    { m: 8, d: 28, kind: 'born', name: 'Johann Wolfgang von Goethe', year: '1749' },
    { m: 8, d: 30, kind: 'born', name: 'Mary Shelley', year: '1797' },
    { m: 9, d: 9, kind: 'born', name: 'Leo Tolstoy', year: '1828' },
    { m: 9, d: 13, kind: 'born', name: 'Roald Dahl', year: '1916' },
    { m: 9, d: 15, kind: 'born', name: 'Agatha Christie', year: '1890' },
    { m: 9, d: 18, kind: 'born', name: 'Dr. Samuel Johnson', year: '1709' },
    { m: 9, d: 21, kind: 'born', name: 'H. G. Wells', year: '1866' },
    { m: 9, d: 24, kind: 'born', name: 'F. Scott Fitzgerald', year: '1896' },
    { m: 9, d: 25, kind: 'born', name: 'William Faulkner', year: '1897' },
    { m: 9, d: 26, kind: 'born', name: 'T. S. Eliot', year: '1888' },
    { m: 9, d: 29, kind: 'born', name: 'Miguel de Cervantes', year: '1547' },
    { m: 10, d: 14, kind: 'born', name: 'E. E. Cummings', year: '1894' },
    { m: 10, d: 15, kind: 'born', name: 'P. G. Wodehouse', year: '1881' },
    { m: 10, d: 16, kind: 'born', name: 'Oscar Wilde', year: '1854' },
    { m: 10, d: 21, kind: 'born', name: 'S. T. Coleridge', year: '1772' },
    { m: 10, d: 27, kind: 'born', name: 'Dylan Thomas', year: '1914' },
    { m: 10, d: 28, kind: 'born', name: 'Evelyn Waugh', year: '1903' },
    { m: 10, d: 31, kind: 'born', name: 'John Keats', year: '1795' },
    { m: 11, d: 8, kind: 'born', name: 'Bram Stoker', year: '1847' },
    { m: 11, d: 10, kind: 'born', name: 'Oliver Goldsmith', year: '1728' },
    { m: 11, d: 11, kind: 'born', name: 'Fyodor Dostoevsky', year: '1821' },
    { m: 11, d: 13, kind: 'born', name: 'Robert Louis Stevenson', year: '1850' },
    { m: 11, d: 22, kind: 'born', name: 'George Eliot', year: '1819' },
    { m: 11, d: 24, kind: 'born', name: 'Laurence Sterne', year: '1713' },
    { m: 11, d: 28, kind: 'born', name: 'William Blake', year: '1757' },
    { m: 11, d: 29, kind: 'born', name: 'C. S. Lewis', year: '1898' },
    { m: 11, d: 30, kind: 'born', name: 'Jonathan Swift', year: '1667' },
    { m: 12, d: 5, kind: 'born', name: 'Christina Rossetti', year: '1830' },
    { m: 12, d: 9, kind: 'born', name: 'John Milton', year: '1608' },
    { m: 12, d: 10, kind: 'born', name: 'Emily Dickinson', year: '1830' },
    { m: 12, d: 16, kind: 'born', name: 'Jane Austen', year: '1775' },
    { m: 12, d: 24, kind: 'born', name: 'Matthew Arnold', year: '1822' },
    { m: 12, d: 26, kind: 'born', name: 'Thomas Gray', year: '1716' },
    { m: 12, d: 30, kind: 'born', name: 'Rudyard Kipling', year: '1865' },
  ];


  const typeLines = [
    { q: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', w: 'Jane Austen · Pride and Prejudice' },
    { q: 'April is the cruellest month, breeding lilacs out of the dead land.', w: 'T. S. Eliot · The Waste Land' },
    { q: 'Call me Ishmael.', w: 'Herman Melville · Moby-Dick' },
    { q: 'It was the best of times, it was the worst of times.', w: 'Charles Dickens · A Tale of Two Cities' },
    { q: 'Whan that Aprille with his shoures soote...', w: 'Geoffrey Chaucer · The Canterbury Tales' },
    { q: 'Mrs Dalloway said she would buy the flowers herself.', w: 'Virginia Woolf · Mrs Dalloway' },
    { q: 'To be, or not to be, that is the question.', w: 'Shakespeare · Hamlet' },
    { q: 'All the world\u2019s a stage, and all the men and women merely players.', w: 'Shakespeare · As You Like It' },
    { q: 'The course of true love never did run smooth.', w: 'Shakespeare · A Midsummer Night\u2019s Dream' },
    { q: 'Frailty, thy name is woman!', w: 'Shakespeare · Hamlet' },
    { q: 'Fair is foul, and foul is fair.', w: 'Shakespeare · Macbeth' },
    { q: 'Life\u2019s but a walking shadow, a poor player that struts and frets his hour upon the stage.', w: 'Shakespeare · Macbeth' },
    { q: 'Uneasy lies the head that wears a crown.', w: 'Shakespeare · Henry IV, Part 2' },
    { q: 'The fault, dear Brutus, is not in our stars, but in ourselves.', w: 'Shakespeare · Julius Caesar' },
    { q: 'Shall I compare thee to a summer\u2019s day?', w: 'Shakespeare · Sonnet 18' },
    { q: 'Of Man\u2019s first disobedience, and the fruit of that forbidden tree...', w: 'John Milton · Paradise Lost' },
    { q: 'The mind is its own place, and in itself can make a Heaven of Hell, a Hell of Heaven.', w: 'John Milton · Paradise Lost' },
    { q: 'Better to reign in Hell, than serve in Heaven.', w: 'John Milton · Paradise Lost' },
    { q: 'They also serve who only stand and wait.', w: 'John Milton · On His Blindness' },
    { q: 'No man is an island, entire of itself.', w: 'John Donne · Meditation XVII' },
    { q: 'Death, be not proud, though some have called thee mighty and dreadful.', w: 'John Donne · Holy Sonnet X' },
    { q: 'For whom the bell tolls; it tolls for thee.', w: 'John Donne · Meditation XVII' },
    { q: 'Had we but world enough, and time, this coyness, lady, were no crime.', w: 'Andrew Marvell · To His Coy Mistress' },
    { q: 'Was this the face that launched a thousand ships?', w: 'Christopher Marlowe · Doctor Faustus' },
    { q: 'Come live with me and be my love.', w: 'Christopher Marlowe · The Passionate Shepherd' },
    { q: 'To err is human, to forgive divine.', w: 'Alexander Pope · An Essay on Criticism' },
    { q: 'A little learning is a dangerous thing.', w: 'Alexander Pope · An Essay on Criticism' },
    { q: 'Fools rush in where angels fear to tread.', w: 'Alexander Pope · An Essay on Criticism' },
    { q: 'The proper study of mankind is Man.', w: 'Alexander Pope · An Essay on Man' },
    { q: 'I wandered lonely as a cloud that floats on high o\u2019er vales and hills.', w: 'William Wordsworth · Daffodils' },
    { q: 'The child is father of the man.', w: 'William Wordsworth · My Heart Leaps Up' },
    { q: 'Poetry is the spontaneous overflow of powerful feelings.', w: 'William Wordsworth · Preface to Lyrical Ballads' },
    { q: 'Water, water, every where, nor any drop to drink.', w: 'S. T. Coleridge · The Rime of the Ancient Mariner' },
    { q: 'In Xanadu did Kubla Khan a stately pleasure-dome decree.', w: 'S. T. Coleridge · Kubla Khan' },
    { q: 'A thing of beauty is a joy for ever.', w: 'John Keats · Endymion' },
    { q: 'Beauty is truth, truth beauty \u2014 that is all ye know on earth.', w: 'John Keats · Ode on a Grecian Urn' },
    { q: 'Heard melodies are sweet, but those unheard are sweeter.', w: 'John Keats · Ode on a Grecian Urn' },
    { q: 'If Winter comes, can Spring be far behind?', w: 'P. B. Shelley · Ode to the West Wind' },
    { q: 'Our sweetest songs are those that tell of saddest thought.', w: 'P. B. Shelley · To a Skylark' },
    { q: 'Poets are the unacknowledged legislators of the world.', w: 'P. B. Shelley · A Defence of Poetry' },
    { q: 'She walks in beauty, like the night of cloudless climes and starry skies.', w: 'Lord Byron · She Walks in Beauty' },
    { q: 'It was a bright cold day in April, and the clocks were striking thirteen.', w: 'George Orwell · 1984' },
    { q: 'All animals are equal, but some animals are more equal than others.', w: 'George Orwell · Animal Farm' },
    { q: 'It is a far, far better thing that I do, than I have ever done.', w: 'Charles Dickens · A Tale of Two Cities' },
    { q: 'Please, sir, I want some more.', w: 'Charles Dickens · Oliver Twist' },
    { q: '\u2019Tis better to have loved and lost than never to have loved at all.', w: 'Alfred, Lord Tennyson · In Memoriam' },
    { q: 'To strive, to seek, to find, and not to yield.', w: 'Alfred, Lord Tennyson · Ulysses' },
    { q: 'The old order changeth, yielding place to new.', w: 'Alfred, Lord Tennyson · Morte d\u2019Arthur' },
    { q: 'God\u2019s in his heaven \u2014 all\u2019s right with the world!', w: 'Robert Browning · Pippa Passes' },
    { q: 'Ah, but a man\u2019s reach should exceed his grasp, or what\u2019s a heaven for?', w: 'Robert Browning · Andrea del Sarto' },
    { q: 'That\u2019s my last Duchess painted on the wall, looking as if she were alive.', w: 'Robert Browning · My Last Duchess' },
    { q: 'I can resist everything except temptation.', w: 'Oscar Wilde · Lady Windermere\u2019s Fan' },
    { q: 'We are all in the gutter, but some of us are looking at the stars.', w: 'Oscar Wilde · Lady Windermere\u2019s Fan' },
    { q: 'The truth is rarely pure and never simple.', w: 'Oscar Wilde · The Importance of Being Earnest' },
    { q: 'Happy families are all alike; every unhappy family is unhappy in its own way.', w: 'Leo Tolstoy · Anna Karenina' },
    { q: 'Beauty will save the world.', w: 'Fyodor Dostoevsky · The Idiot' },
    { q: 'Do I dare disturb the universe?', w: 'T. S. Eliot · The Love Song of J. Alfred Prufrock' },
    { q: 'This is the way the world ends: not with a bang but a whimper.', w: 'T. S. Eliot · The Hollow Men' },
    { q: 'I have measured out my life with coffee spoons.', w: 'T. S. Eliot · The Love Song of J. Alfred Prufrock' },
    { q: 'Things fall apart; the centre cannot hold.', w: 'W. B. Yeats · The Second Coming' },
    { q: 'Tread softly because you tread on my dreams.', w: 'W. B. Yeats · He Wishes for the Cloths of Heaven' },
    { q: 'Where the mind is without fear and the head is held high.', w: 'Rabindranath Tagore · Gitanjali' },
    { q: 'Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather.', w: 'James Joyce · Ulysses' },
    { q: 'A woman must have money and a room of her own if she is to write fiction.', w: 'Virginia Woolf · A Room of One\u2019s Own' },
    { q: 'Nothing to be done.', w: 'Samuel Beckett · Waiting for Godot' },
    { q: 'The past is a foreign country: they do things differently there.', w: 'L. P. Hartley · The Go-Between' },
    { q: 'Two roads diverged in a wood, and I \u2014 I took the one less traveled by.', w: 'Robert Frost · The Road Not Taken' },
    { q: 'And miles to go before I sleep.', w: 'Robert Frost · Stopping by Woods on a Snowy Evening' },
    { q: 'Hope is the thing with feathers that perches in the soul.', w: 'Emily Dickinson · Hope Is the Thing with Feathers' },
    { q: 'Because I could not stop for Death, he kindly stopped for me.', w: 'Emily Dickinson · Because I Could Not Stop for Death' },
  ];

  /* ---------- Search index: only pages that really exist ---------- */
  const searchIndex = [
    ['Age', '#0B5750', 'Old English (450\u20131066)', '/english-literature/#old-english'],
    ['Age', '#0B5750', 'Middle English (1066\u20131500)', '/english-literature/#middle-english'],
    ['Age', '#0B5750', 'Renaissance (1500\u20131603)', '/english-literature/#renaissance'],
    ['Age', '#0B5750', 'Jacobean & Caroline (1603\u20131660)', '/english-literature/#jacobean'],
    ['Age', '#0B5750', 'Restoration (1660\u20131700)', '/english-literature/#restoration'],
    ['Age', '#0B5750', 'Augustan (1700\u20131798)', '/english-literature/#augustan'],
    ['Age', '#0B5750', 'Romantic (1798\u20131837)', '/english-literature/#romantic'],
    ['Age', '#0B5750', 'Victorian (1837\u20131901)', '/english-literature/#victorian'],
    ['Age', '#0B5750', 'Modern (1901\u20131945)', '/english-literature/#modern'],
    ['Age', '#0B5750', 'Contemporary (1945 \u2192)', '/english-literature/#contemporary'],
    ['Note', '#4A5A6A', 'Old English Literature \u2014 full notes', '/notes/old-english/'],
    ['Note', '#4A5A6A', 'Middle English Literature \u2014 full notes', '/notes/middle-english/'],
    ['Note', '#4A5A6A', 'Renaissance Literature \u2014 full notes', '/notes/renaissance/'],
    ['Note', '#4A5A6A', 'Jacobean and Caroline Literature \u2014 full notes', '/notes/jacobean-and-caroline-age/'],
    ['Note', '#4A5A6A', 'Restoration Literature \u2014 full notes', '/notes/restoration-age/'],
    ['Note', '#4A5A6A', 'The Augustan Age \u2014 full notes', '/notes/augustan-age/'],
    ['Note', '#4A5A6A', 'The Romantic Age — full notes', '/notes/romantic-age/'],
    ['Note', '#4A5A6A', 'The Victorian Age \u2014 full notes', '/notes/victorian-age/'],
    ['Note', '#4A5A6A', 'The Modern Age — full notes', '/notes/modern-age/'],
    ['Note', '#4A5A6A', 'Contemporary English Literature — full notes', '/notes/contemporary-age/'],
    ['Exam', '#C2410C', 'UGC-NET / JRF / SET English', '/exams/net/'],
    ['Exam', '#C2410C', 'PGT English Literature', '/exams/pgt/'],
    ['Exam', '#C2410C', 'State PSC English', '/exams/state-psc/'],
    ['Exam', '#C2410C', 'MA / BA \u2014 University syllabus', '/exams/ma-ba/'],
    ['Quiz', '#B45309', 'Daily Quiz', '/quizzes/daily/'],
    ['Quiz', '#B45309', 'MCQ practice', '/quizzes/mcq/'],
    ['Quiz', '#B45309', 'Previous year questions (PYQ)', '/quizzes/pyq/'],
    ['Quiz', '#B45309', 'Mock Tests', '/quizzes/mock-tests/'],
    ['Page', '#0F766E', 'Video Lessons', '/video-lessons/'],
    ['Page', '#0F766E', 'My Publisher', '/publish-with-us/'],
    ['Page', '#0F766E', 'Research Support', '/research-support/'],
    ['Page', '#0F766E', 'Download', '/download/'],
    ['Page', '#0F766E', 'About AK Explained', '/about/'],
    ['Page', '#0F766E', 'Contact us', '/contact/'],
  ].map(function (r) {
    return { type: r[0], bg: r[1], name: r[2], href: r[3], hay: r[2].toLowerCase() };
  });


  /* ---------- Ages: British literary periods ----------
     Image swap karne ke liye bas assets/ages/<slug>.webp file replace kar dijiye. */
  const ages = [
    { slug:'old-english',    yr:'450',  name:'Old English',        era:'450 \u2013 1066',   who:'Beowulf \u00b7 Caedmon \u00b7 Cynewulf', article:'/notes/old-english/' },
    { slug:'middle-english', yr:'1066', name:'Middle English',     era:'1066 \u2013 1500',  who:'Chaucer \u00b7 Langland \u00b7 Malory', article:'/notes/middle-english/' },
    { slug:'renaissance',    yr:'1500', name:'Renaissance',        era:'1500 \u2013 1603',  who:'Shakespeare \u00b7 Marlowe \u00b7 Spenser', article:'/notes/renaissance/' },
    { slug:'jacobean',       yr:'1603', name:'Jacobean & Caroline',era:'1603 \u2013 1660',  who:'Donne \u00b7 Jonson \u00b7 Webster', article:'/notes/jacobean-and-caroline-age/' },
    { slug:'restoration',    yr:'1660', name:'Restoration',        era:'1660 \u2013 1700',  who:'Dryden \u00b7 Behn \u00b7 Congreve', article:'/notes/restoration-age/' },
    { slug:'augustan',       yr:'1700', name:'Augustan',           era:'1700 \u2013 1798',  who:'Pope \u00b7 Swift \u00b7 Johnson', article:'/notes/augustan-age/' },
    { slug:'romantic',       yr:'1798', name:'Romantic',           era:'1798 \u2013 1837',  who:'Wordsworth \u00b7 Coleridge \u00b7 Keats', article:'/notes/romantic-age/' },
    { slug:'victorian',      yr:'1837', name:'Victorian',          era:'1837 \u2013 1901',  who:'Dickens \u00b7 Tennyson \u00b7 Hardy', article:'/notes/victorian-age/' },
    { slug:'modern',         yr:'1901', name:'Modern',             era:'1901 \u2013 1945',  who:'Eliot \u00b7 Woolf \u00b7 Joyce', article:'/notes/modern-age/' },
    { slug:'contemporary',   yr:'1945', name:'Contemporary',       era:'1945 \u2192',       who:'Beckett \u00b7 Larkin \u00b7 Rushdie', article:'/notes/contemporary-age/' },
  ];

  /* ---------- Videos: real lessons on the channel ----------
     `title` khaali hai to card par "Watch on YouTube" dikhta hai.
     Asli title likh dene par wahi dikhne lagega. */
  const videos = [
    { id:'D9Smtxac0B4', title:'The Rime of the Ancient Mariner',        note:'Samuel Taylor Coleridge' },
    { id:'sQ-PS8MT7cI', title:'The Solitary Reaper by William Wordsworth', note:'Romantic poetry' },
    { id:'95rzAsRpbEk', title:'Philosophy of Paul de Man',              note:'Criticism & literary theory' },
    { id:'M5gV6mMxf_k', title:'Biography of Franz Kafka',               note:'Modern fiction' },
  ];

  /* ---------- Student reviews ----------
     Reviews assets/reviews.json se aate hain, taaki Pages CMS se approve
     karke publish kiye ja sakein. Code chhoone ki zarurat nahi.
     Har item: { name, role, stars, photo, text }
     4 ya zyada hone par carousel apne aap chalne lagta hai. */
  let reviews = [];


  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  /* ---------- 1. Today in Literary History ---------- */
  function renderBirthday() {
    const tagEl = document.getElementById('bdayTag');
    const textEl = document.getElementById('bdayText');
    if (!tagEl || !textEl) return;

    const now = new Date();
    const todayKey = (now.getMonth() + 1) * 100 + now.getDate();

    // Exact match for today, else the next one coming up in the calendar.
    let hit = bdayEvents.filter(function (e) { return e.m * 100 + e.d === todayKey; })[0];
    let isToday = !!hit;

    if (!hit) {
      const later = bdayEvents.filter(function (e) { return e.m * 100 + e.d > todayKey; });
      hit = later.length ? later[0] : bdayEvents[0];
    }

    const dateStr = hit.d + ' ' + MONTHS[hit.m - 1];
    tagEl.textContent = isToday ? 'Today in Literary History' : 'Coming up · ' + dateStr;

    const verb = hit.kind === 'died' ? 'death anniversary' : 'birth anniversary';
    // The tag already carries the date, so the sentence does not repeat it.
    textEl.innerHTML = (isToday ? 'It is the ' : 'The ') + verb +
      ' of <strong>' + hit.name + '</strong> (' + hit.year + ')';
  }

  /* ---------- 2. Animated opening line ---------- */
  function runTypewriter() {
    const qEl = document.getElementById('typeText');
    const wEl = document.getElementById('typeWho');
    if (!qEl || !wEl) return;

    // Respect the visitor's reduced-motion setting: show one line, no animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const one = typeLines[Math.floor(Math.random() * typeLines.length)];
      qEl.textContent = '“' + one.q + '”';
      wEl.textContent = '— ' + one.w;
      return;
    }

    let i = Math.floor(Math.random() * typeLines.length);
    let char = 0;
    let erasing = false;

    (function tick() {
      const line = typeLines[i];
      if (!erasing) {
        char++;
        qEl.textContent = '“' + line.q.slice(0, char) + '”';
        wEl.textContent = char >= line.q.length ? '— ' + line.w : '';
        if (char >= line.q.length) { erasing = true; return setTimeout(tick, 2600); }
        return setTimeout(tick, 34);
      }
      char -= 3;
      if (char <= 0) {
        erasing = false; char = 0;
        i = (i + 1) % typeLines.length;
        return setTimeout(tick, 320);
      }
      qEl.textContent = '“' + line.q.slice(0, char) + '”';
      wEl.textContent = '';
      setTimeout(tick, 14);
    })();
  }

  /* ---------- 3. Search ---------- */
  function wireSearch() {
    const input = document.getElementById('siteSearch');
    const panel = document.getElementById('searchPanel');
    if (!input || !panel) return;

    function close() { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); }

    input.addEventListener('input', function () {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) return close();

      const hits = searchIndex.filter(function (r) { return r.hay.indexOf(q) !== -1; }).slice(0, 7);
      panel.innerHTML = hits.length
        ? hits.map(function (r) {
            return '<a href="' + r.href + '"><span class="tag" style="background:' + r.bg + '">' +
                   r.type + '</span><span class="nm">' + r.name + '</span><span class="go">→</span></a>';
          }).join('')
        : '<p class="empty">Nothing found. Try &ldquo;Victorian&rdquo;, &ldquo;NET&rdquo;, &ldquo;MCQ&rdquo; or &ldquo;Renaissance&rdquo;.</p>';

      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    });

    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== input) close();
    });
  }


  /* ---------- Ages grid ---------- */
  function renderAges() {
    const grid = document.getElementById('ageGrid');
    if (!grid) return;
    grid.innerHTML = ages.map(function (a) {
      // Article ban chuka ho to reader seedha wahan jaaye; warna timeline page par.
      const to = a.article || ('/english-literature/#' + a.slug);
      return '<a class="agecard" href="' + to + '">' +
             '<span class="thumb"><img src="/assets/ages/' + a.slug + '.webp" alt="" width="480" height="300" loading="lazy">' +
             '<span class="yr">' + a.yr + '</span></span>' +
             '<h3>' + a.name + '</h3>' +
             '<p class="era">' + a.era + '</p>' +
             '<p class="who">' + a.who + '</p></a>';
    }).join('');
  }

  /* ---------- Video grid ---------- */
  function renderVideos() {
    const grid = document.getElementById('vidGrid');
    if (!grid) return;
    grid.innerHTML = videos.map(function (v) {
      const label = v.title || 'Watch on YouTube';
      const note = v.note || 'AK Explained \u00b7 YouTube';
      return '<a class="vidcard" href="https://youtu.be/' + v.id + '" target="_blank" rel="noopener">' +
             '<span class="thumb">' +
             '<img src="https://img.youtube.com/vi/' + v.id + '/hqdefault.jpg" alt="" width="480" height="360" ' +
             'loading="lazy" onerror="this.style.display=\'none\'">' +
             '<span class="play"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
             '<path d="M8 5.5v13l11-6.5Z"/></svg></span></span>' +
             '<h3>' + label + '</h3><p>' + note + '</p></a>';
    }).join('');
  }

  /* Review ka text bahar se aata hai, isliye page me daalne se pehle
     HTML escape karna zaroori hai. */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- Reviews carousel ---------- */
  function renderReviews() {
    const track = document.getElementById('reviewTrack');
    if (!track) return;
    const wrapEl = track.parentElement;
    const prev = wrapEl.querySelector('.rvbtn.prev');
    const next = wrapEl.querySelector('.rvbtn.next');

    if (!reviews.length) {
      track.classList.add('empty');
      // Reviews login ke saath chalu honge. Tab tak Coming soon.
      track.innerHTML =
        '<div class="rvcard placeholder">' +
        '<img class="face" src="/assets/avatar-placeholder.webp" alt="" width="60" height="60">' +
        '<span class="soonbadge">Coming soon</span>' +
        '<p class="txt">Student reviews will appear here once accounts are ready.</p>' +
        '</div>' +
        '<div class="rvcard placeholder dim"><img class="face" src="/assets/avatar-placeholder.webp" alt="" width="60" height="60"><p class="txt">Coming soon</p></div>' +
        '<div class="rvcard placeholder dim"><img class="face" src="/assets/avatar-placeholder.webp" alt="" width="60" height="60"><p class="txt">Coming soon</p></div>';
      return;
    }

    track.innerHTML = reviews.map(function (r) {
      const n = Math.max(1, Math.min(5, parseInt(r.stars, 10) || 5));
      const stars = '\u2605'.repeat(n) + '<span class="off">' + '\u2605'.repeat(5 - n) + '</span>';
      const photo = /^\/[\w\-./]*$/.test(r.photo || '') ? r.photo : '/assets/avatar-placeholder.webp';
      return '<div class="rvcard">' +
             '<p class="stars">' + stars + '</p>' +
             (r.heading ? '<h3 class="rvhead">' + esc(r.heading) + '</h3>' : '') +
             '<p class="txt">\u201C' + esc(r.text) + '\u201D</p>' +
             '<div class="who">' +
             '<img class="face" src="' + photo + '" alt="" width="46" height="46" loading="lazy">' +
             '<span><b>' + esc(r.name) + '</b>' + (r.role ? '<i>' + esc(r.role) + '</i>' : '') + '</span>' +
             '</div></div>';
    }).join('');

    function perView() {
      if (window.matchMedia('(min-width:1000px)').matches) return 3;
      if (window.matchMedia('(min-width:640px)').matches) return 2;
      return 1;
    }

    let at = 0;
    let timer = null;

    function maxAt() { return Math.max(0, reviews.length - perView()); }

    function show() {
      const card = track.querySelector('.rvcard');
      if (!card) return;
      const step = card.getBoundingClientRect().width + 16; // 16px = track gap
      if (at > maxAt()) at = 0;
      track.style.transform = 'translateX(-' + (at * step) + 'px)';
    }

    function go(n) { at = n < 0 ? maxAt() : (n > maxAt() ? 0 : n); show(); }

    // Arrows and auto-advance only pay their way once the row actually overflows.
    if (reviews.length > perView()) {
      prev.hidden = next.hidden = false;
      prev.addEventListener('click', function () { go(at - 1); rest(); });
      next.addEventListener('click', function () { go(at + 1); rest(); });

      const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function start() { if (!slow) timer = setInterval(function () { go(at + 1); }, 4500); }
      function rest() { clearInterval(timer); start(); }
      wrapEl.addEventListener('mouseenter', function () { clearInterval(timer); });
      wrapEl.addEventListener('mouseleave', start);
      start();
    }

    window.addEventListener('resize', show);
    show();
  }

  function loadReviews() {
    return fetch('/assets/reviews.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && Array.isArray(d.items)) reviews = d.items; })
      .catch(function () { /* file na mile to placeholder hi dikhega */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderAges();
    renderVideos();
    loadReviews().then(renderReviews);
    renderBirthday();
    runTypewriter();
    wireSearch();
  });
})();
