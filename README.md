# TOC Simulator

An interactive web-based tool designed to teach and test Theory of Computation (TOC) concepts through visualization and simulation. This modern platform bridges the gap between abstract theoretical models and practical understanding.

## 🚀 Features

### Core Functionality
- **Automata Design & Simulation**: Create and simulate DFA, NFA, Regular Expressions, and Turing Machines
- **3D Visualization**: Interactive Three.js powered 3D models with zoom, pan, and rotation
- **Step-by-Step Execution**: Trace input processing with pause, play, and rewind controls
- **Interactive Visualization**: Drag-and-drop interface with real-time state highlighting
- **Model Conversion**: Automatic NFA → DFA conversion and Regex to NFA/DFA transformation
- **Cloud Storage**: Save and share projects via Firebase Firestore

### Advanced Features
- **3D Visualization**: Three.js powered 3D models with zoom and pan
- **Theme Customization**: Light/dark modes with modern UI
- **Error Detection**: Real-time validation and syntax checking
- **Analytics**: Progress tracking with Chart.js and Firebase Analytics
- **Accessibility**: Keyboard shortcuts and screen reader support

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Analytics**: Chart.js, Firebase Analytics
- **Deployment**: Vercel

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for full functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/toc-simulator.git
cd toc-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (optional for basic functionality):
   - Create a Firebase project
   - Copy your Firebase config to `src/lib/firebase.ts`
   - Enable Firestore, Auth, and Storage

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating an Automaton
1. Navigate to the Simulator page
2. Click on the canvas to add states
3. Double-click states to set as initial/final
4. Use "Add Transition" mode to connect states
5. Enter input strings to test your automaton

### Simulation
1. Enter an input string in the input field
2. Click "Simulate" to run the simulation
3. Use the simulation controls to step through execution
4. View detailed step-by-step results

### Saving and Loading
- Use the Save/Load buttons to persist your work
- Export automata as JSON files
- Share projects via generated links

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── simulator/         # Simulator page
├── components/            # React components
│   ├── automata/         # Automata-specific components
│   ├── layout/           # Layout components
│   ├── sections/         # Page sections
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── simulation.ts     # Simulation engine
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
    └── automata.ts       # Automata type definitions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **AutomataEditor**: Main editor interface with drag-and-drop functionality
- **SimulationViewer**: Step-by-step simulation visualization
- **SimulationEngine**: Core simulation logic for DFA/NFA execution
- **ThemeProvider**: Dark/light mode theme management

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic DFA/NFA editor
- [x] Step-by-step simulation
- [x] Modern UI with themes
- [x] Firebase integration
- [x] 3D visualization with Three.js

### Phase 2 (Next)
- [ ] NFA to DFA conversion
- [ ] Regex parsing and conversion
- [ ] Advanced analytics dashboard

### Phase 3 (Future)
- [ ] Pushdown Automata support
- [ ] Context-Free Grammar simulation
- [ ] AI-powered assistance
- [ ] Multi-user collaboration
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by JFLAP and other educational tools
- Built with modern web technologies
- Designed for accessibility and usability

## 📞 Support

- 📧 Email: support@tocsimulator.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/toc-simulator/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/toc-simulator/wiki)

---

**TOC Simulator** - Making Theory of Computation accessible through interactive visualization.