import json

with open('data/cdcs.json') as f:
    data = json.load(f)

def C(code, title):
    return {"code": code, "title": title}

# ---- New BE programmes ----

data["BE"]["Architecture and Urban Engineering"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("AUE F211", "Basic Design for Visualization"),
        C("AUE F212", "Structural Mechanics"),
        C("AUE F213", "Fluid Mechanics and Applications"),
        C("CE F230", "Civil Engineering Materials"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("AUE F241", "Architectural Design Studio I"),
        C("AUE F242", "Building Construction & Technology"),
        C("AUE F243", "Construction Economics"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year3_sem1": [
        C("AUE F311", "Architectural Design Studio II"),
        C("AUE F312", "Geotechnical Design"),
        C("AUE F313", "Design of Reinforced Concrete Structures"),
        C("AUE F314", "Highway Planning, Analysis and Design"),
    ],
    "year3_sem2": [
        C("AUE F341", "Urban Planning and Sustainable Communities"),
        C("AUE F342", "Building Acoustics and Lighting Design"),
        C("AUE F343", "Design of Steel Structures"),
        C("AUE F344", "Directed Research in Architecture - I"),
    ],
}

data["BE"]["Biotechnology"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("BIOT F211", "Biological Chemistry"),
        C("BIOT F212", "Microbiology"),
        C("BIOT F215", "Biophysics"),
        C("BIOT F213", "Cell Biology"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("BIOT F241", "Genetic Engineering Techniques"),
        C("BIOT F243", "Genetics"),
        C("BIOT F245", "Introduction to Environmental Biotechnology"),
        C("BIOT F244", "Instrumental Methods of Analysis"),
    ],
    "year3_sem1": [
        C("BIOT F311", "Recombinant DNA Technology"),
        C("BIOT F314", "Industrial Microbiology & Bioprocess Engineering"),
    ],
    "year3_sem2": [
        C("BIOT F342", "Immunology"),
        C("BIOT F343", "Experiments in Biotechnology"),
        C("BIOT F344", "Downstream Processing"),
    ],
}

data["BE"]["Biotechnology with Specialization in Applied Molecular Biology"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("BIOT F211", "Biological Chemistry"),
        C("BIOT F212", "Microbiology"),
        C("BIOT F215", "Biophysics"),
        C("BIOT F213", "Cell Biology"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("BIOT F241", "Genetic Engineering Techniques"),
        C("BIOT F243", "Genetics"),
        C("BIOT F245", "Introduction to Environmental Biotechnology"),
        C("BIOT F244", "Instrumental Methods of Analysis"),
    ],
    "year3_sem1": [
        C("BIOT F311", "Recombinant DNA Technology"),
        C("BIOT F314", "Industrial Microbiology & Bioprocess Engineering"),
    ],
    "year3_sem2": [
        C("BIOT F342", "Immunology"),
        C("BIOT F343", "Experiments in Biotechnology"),
        C("BIOT F344", "Downstream Processing"),
    ],
}

data["BE"]["Chemical with Specialization in Energy, Environment, and Sustainability"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("CHE F211", "Chemical Process Calculations"),
        C("CHE F214", "Engineering Chemistry"),
        C("CHE F213", "Chemical Engineering Thermodynamics"),
        C("CHE F212", "Fluid Mechanics"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("CHE F241", "Heat Transfer"),
        C("CHE F242", "Numerical Methods for Chemical Engineers"),
        C("CHE F243", "Material Science & Engineering"),
        C("CHE F244", "Separation Processes I"),
    ],
    "year3_sem1": [
        C("CHE F312", "Chemical Engineering Laboratory I"),
        C("CHE F313", "Separation Processes II"),
        C("CHE F311", "Kinetics & Reactor Design"),
        C("CHE F314", "Process Design Principles I"),
    ],
    "year3_sem2": [
        C("CHE F341", "Chemical Engineering Laboratory II"),
        C("CHE F342", "Process Dynamics & Control"),
        C("CHE F343", "Process Design Principles II"),
    ],
}

data["BE"]["Electronics & Computer Engineering"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("ECOM F213", "Object Oriented Programming"),
        C("ECOM F214", "Electronic Devices"),
        C("ECOM F215", "Digital Design"),
        C("ECOM F222", "Discrete Structures for Computer Science"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("ECOM F211", "Data Structures and Algorithms"),
        C("ECOM F241", "Microprocessors and Interfacing"),
        C("ECOM F242", "Control Systems"),
        C("ECOM F243", "Signals & Systems"),
        C("ECOM F244", "Microelectronic Circuits"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year3_sem1": [
        C("ECOM F313", "Analog & Digital VLSI Design"),
        C("ECOM F342", "Computer Architecture"),
        C("ECOM F343", "Communication Networks"),
    ],
    "year3_sem2": [
        C("ECOM F321", "Real Time Operating Systems"),
        C("ECOM F462", "Network Programming"),
    ],
}

data["BE"]["Mechanical with Specialization in Aerospace"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("ME F211", "Mechanics of Solids"),
        C("ME F212", "Fluid Mechanics"),
        C("ME F216", "Materials Science & Engineering"),
        C("ME F217", "Applied Thermodynamics"),
    ],
    "year2_sem2": [
        C("BITS F225", "Environmental Studies"),
        C("ECON F211", "Principles of Economics"),
        C("ME F218", "Advanced Mechanics of Solids"),
        C("ME F219", "Manufacturing Processes"),
        C("ME F220", "Heat Transfer"),
        C("ME F221", "Mechanisms and Machines"),
    ],
    "year3_sem1": [
        C("ME F314", "Design of Machine Elements"),
        C("ME F315", "Advanced Manufacturing Processes"),
        C("ME F316", "Manufacturing Management"),
        C("ME F317", "Engines, Motors, and Mobility"),
    ],
    "year3_sem2": [
        C("ME F318", "Computer-Aided Design"),
        C("ME F319", "Vibrations & Control"),
        C("ME F320", "Engineering Optimization"),
        C("ME F341", "Prime Movers & Fluid Machines"),
    ],
}

data["BE"]["Manufacturing"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("MF F211", "Mechanics of Solids"),
        C("MF F216", "Materials Science & Engineering"),
        C("MF F217", "Machine Drawing"),
        C("MF F218", "Transport Phenomena in Manufacturing"),
    ],
    "year2_sem2": [
        C("BITS F225", "Environmental Studies"),
        C("ECON F211", "Principles of Economics"),
        C("MF F219", "Operations Management"),
        C("MF F220", "Metrology and Quality Assurance"),
        C("MF F221", "Mechanisms and Machines"),
        C("MF F222", "Casting, Forming and Welding"),
    ],
    "year3_sem1": [
        C("MF F314", "Design of Machine Elements"),
        C("MF F315", "Automation and Control"),
        C("MF F316", "Machining and Machine Tools"),
    ],
    "year3_sem2": [
        C("MF F317", "Computer Aided Design and Manufacturing"),
        C("MF F318", "Non Traditional Manufacturing Processes"),
        C("MF F319", "Supply Chain Management"),
        C("MF F320", "Engineering Optimization"),
    ],
}

data["BE"]["Mathematics and Computing"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("MAC F211", "Linear Algebra and Applications"),
        C("MAC F212", "Object Oriented Programming"),
        C("MAC F213", "Discrete Mathematics"),
        C("MAC F214", "Elementary Real Analysis"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("MAC F241", "Numerical Analysis"),
        C("MAC F242", "Data Structures & Algorithms"),
        C("MAC F243", "Numerical Optimization"),
        C("MAC F244", "Stochastic Calculus and Application to Finance"),
        C("MAC F245", "Scientific Computing Laboratory"),
    ],
    "year3_sem1": [
        C("MAC F311", "Algebra I"),
        C("MAC F312", "Foundations of Data Science"),
        C("MAC F313", "Statistical Data Analysis"),
        C("MAC F314", "Mathematical Modelling"),
    ],
    "year3_sem2": [
        C("MAC F341", "Design and Analysis of Algorithms"),
        C("MAC F342", "Computational Partial Differential Equations"),
    ],
}

data["BE"]["Pharmacy"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("PHA F211", "Pharmaceutical Analysis"),
        C("BITS F219", "Process Engineering"),
        C("PHA F242", "Biological Chemistry"),
        C("PHA F217", "Pharmaceutical Microbiology"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("BITS F111", "Thermodynamics"),
        C("PHA F241", "Pharmaceutical Chemistry"),
        C("MATH F113", "Probability and Statistics"),
        C("PHA F215", "Introduction to Molecular Biology and Immunology"),
        C("PHA F244", "Physical Pharmacy"),
    ],
    "year3_sem1": [
        C("PHA F311", "Pharmacology I"),
        C("PHA F312", "Medicinal Chemistry I"),
        C("PHA F313", "Instrumental Methods of Analysis"),
        C("PHA F315", "Pharmaceutical Formulations II"),
    ],
    "year3_sem2": [
        C("PHA F341", "Pharmacology II"),
        C("PHA F342", "Medicinal Chemistry II"),
        C("PHA F343", "Forensic Pharmacy"),
        C("PHA F344", "Natural Drugs"),
    ],
}

# ---- New MSc programmes ----

data["MSc"]["General Studies - Communication and Media Studies"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("GS F221", "Business Communication"),
        C("GS F222", "Language Lab Practice"),
        C("GS F223", "Introduction to Mass Communication"),
        C("GS F224", "Print & Audio Visual Advertising"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("ECON F211", "Principles of Economics"),
        C("GS F244", "Reporting & Writing for Media"),
        C("GS F241", "Creative Writing"),
        C("GS F245", "Effective Public Speaking"),
        C("GS F243", "Current Affairs"),
    ],
    "year3_sem1": [
        C("GS F321", "Mass Media Content & Design"),
        C("GS F322", "Critical Analysis of Literature & Cinema"),
    ],
    "year3_sem2": [
        C("GS F342", "Computer Mediated Communication"),
        C("GS F343", "Short Film & Video Production"),
    ],
}

data["MSc"]["General Studies - Development Studies"] = {
    "year2_sem1": [
        C("MATH F211", "Mathematics III"),
        C("GS F211", "Modern Political Concepts"),
        C("GS F212", "Environment, Development & Climate Change"),
        C("GS F213", "Development Theories"),
        C("ECON F211", "Principles of Economics"),
        C("BITS F225", "Environmental Studies"),
    ],
    "year2_sem2": [
        C("MGTS F211", "Principles of Management"),
        C("GS F231", "Dynamics of Social Change"),
        C("GS F232", "Introductory Psychology"),
        C("GS F233", "Public Policy"),
        C("GS F234", "Development Economics"),
    ],
    "year3_sem1": [
        C("GS F311", "Introduction to Conflict Management"),
        C("GS F312", "Applied Philosophy"),
    ],
    "year3_sem2": [
        C("GS F331", "Techniques in Social Research"),
        C("GS F332", "Contemporary India"),
        C("GS F333", "Public Administration"),
        C("GS F334", "Global Business Technology & Knowledge Sharing"),
    ],
}

# ---- New BBA programme (own Year 1, since it differs from the common Year 1) ----

data["BBA"] = {
    "Business Administration (Honours)": {
        "year1_sem1": [
            C("MATH F114", "Mathematics for Business"),
            C("CS F111", "Computer Programming"),
            C("BITS F115", "Introduction to Basic Sciences"),
            C("BITS F330", "Negotiation Skills and Techniques"),
            C("MGTS F211", "Principles of Management"),
            C("HSS F211", "Introduction to Arabic (or Chinese / French)"),
        ],
        "year1_sem2": [
            C("MATH F113", "Probability and Statistics"),
            C("BITS F121", "Introduction to Python"),
            C("BITS F122", "Introduction to Spreadsheet Analysis"),
            C("BBA F121", "Business Ethics and Corporate Social Responsibility"),
            C("ECON F242", "Microeconomics"),
            C("BITS F225", "Environmental Studies"),
            C("BITS F123", "Introduction to Engineering"),
        ],
        "year2_sem1": [
            C("MATH F212", "Optimization"),
            C("MGTS F351", "Organizational Behaviour"),
            C("GS F221", "Business Communication"),
            C("BBA F211", "Financial and Management Accounting"),
            C("ECON F243", "Macroeconomics"),
        ],
        "year2_sem2": [
            C("MGTS F314", "Essentials of Financial Management"),
            C("BBA F221", "Human Resource Management"),
            C("BBA F222", "Business Law and Compliance"),
            C("MGTS F311", "Marketing"),
            C("ECON F241", "Econometric Methods"),
        ],
        "year3_sem1": [
            C("ECON F414", "Creating and Leading Entrepreneurial Organization"),
            C("MF F219", "Operations Management"),
            C("BBA F311", "Design Thinking"),
        ],
        "year3_sem2": [
            C("ECON F434", "International Business"),
            C("BBA F321", "Digital Enterprises"),
            C("BITS F428", "Essentials of Strategic Management"),
        ],
    }
}

with open('data/cdcs.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated cdcs.json successfully.")
