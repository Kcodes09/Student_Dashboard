import { driver } from "driver.js";

// Helper to determine active steps based on route
export function getTourSteps(pathname: string, getDriver?: () => any) {
  const steps: any[] = [];

  // Common steps for the Navbar (available on most pages)
  const navbarSteps = [
    {
      element: '#tour-theme-toggle',
      popover: {
        title: 'Theme & Customization',
        description: 'Toggle between Dark and Light mode, or activate the fun World Cup mode here.',
        side: "bottom", align: 'start'
      }
    },
    {
      element: '#tour-profile',
      popover: {
        title: 'Your Profile',
        description: 'Click here to edit your personal details, branch, and preferences.',
        side: "bottom", align: 'start'
      }
    }
  ];

  if (pathname === '/dashboard') {
    steps.push(
      {
        element: '#tour-next-class',
        popover: {
          title: 'Upcoming Classes & Exams',
          description: 'This widget automatically updates to show your very next class or any upcoming exams for today/tomorrow.',
          side: "bottom", align: 'start'
        }
      },
      {
        element: '#tour-nav-cards',
        popover: {
          title: 'Dashboard Navigation',
          description: 'Access your Timetable, Calendar, Attendance, and more from these quick links.',
          side: "top", align: 'start'
        }
      },
      ...navbarSteps
    );
  } 
  else if (pathname.startsWith('/dashboard/timetable')) {
    // Timetable Manager page
    if (typeof window !== 'undefined' && !window.location.search.includes('id=')) {
      steps.push(
        {
          element: '#tour-new-draft',
          popover: {
            title: 'Timetable Drafts',
            description: 'Click this highlighted button to create a new draft!',
            side: "bottom", align: 'start',
            // @ts-ignore - hide the next button so they are forced to click the actual element
            showButtons: ['close'] 
          },
          onHighlighted: () => {
            const btn = document.getElementById('tour-new-draft');
            if (btn) {
              btn.addEventListener('click', () => {
                const drv = getDriver && getDriver();
                setTimeout(() => {
                  if (drv) drv.moveNext();
                }, 200);
              }, { once: true });
            }
          }
        },
        {
          element: '#tour-modal-primary',
          popover: {
            title: 'Primary Branch',
            description: 'Select your primary degree. The system will automatically fetch the CDCs for this branch!',
            side: "bottom", align: 'start'
          }
        },
        {
          element: '#tour-modal-id',
          popover: {
            title: 'Your 4-Digit ID',
            description: 'We use this to determine specific course electives that might be locked to your batch. (e.g. 1022)',
            side: "bottom", align: 'start'
          }
        }
      );
      return steps;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    steps.push(
      {
        element: '#tour-search-bar',
        popover: {
          title: 'Find Courses',
          description: 'Search for courses by code or name, and sort them easily.',
          side: "bottom", align: 'start'
        }
      },
      {
        element: '#tour-cdc-toggle',
        popover: {
          title: 'Your CDCs',
          description: 'Toggle between your mandatory core courses (CDCs) and other electives.',
          side: "bottom", align: 'start'
        }
      },
      {
        element: '#tour-course-list',
        popover: {
          title: 'Course Selection',
          description: 'Click on any course to view its sections. Selected courses will have a green checkmark or warning if sections are clashing.',
          side: "right", align: 'start'
        }
      },
      {
        element: isMobile ? '#tour-action-buttons-mobile' : '#tour-action-buttons-desktop',
        popover: {
          title: 'Timetable Controls',
          description: 'Save your timetable, undo/redo changes, or export it as a PNG/ICS calendar file.',
          side: "bottom", align: 'end'
        }
      },
      {
        element: isMobile ? '#tour-timetable-grid-mobile' : '#tour-timetable-grid-desktop',
        popover: {
          title: 'Your Weekly Grid',
          description: 'Your selected sections will automatically populate here. Hover over them for room and instructor details!',
          side: "top", align: 'center'
        }
      }
    );
  }
  else if (pathname.startsWith('/dashboard/attendance')) {
    steps.push(
      {
        element: '#tour-attendance-summary',
        popover: {
          title: 'Attendance Overview',
          description: 'Track your overall attendance percentage and see how many classes you can afford to miss.',
          side: "bottom", align: 'start'
        }
      },
      {
        element: '#tour-add-entry',
        popover: {
          title: 'Log Attendance',
          description: 'Click here to record whether you attended or missed a class.',
          side: "left", align: 'start'
        }
      }
    );
  }
  else if (pathname.startsWith('/dashboard/calendar')) {
    steps.push(
      {
        element: '#tour-calendar-view',
        popover: {
          title: 'Monthly Calendar',
          description: 'View all your classes, exams, and holidays in one place. Click on any day to see details.',
          side: "top", align: 'start'
        }
      }
    );
  }
  else if (pathname.startsWith('/dashboard/exams')) {
    steps.push(
      {
        element: '#tour-exam-list',
        popover: {
          title: 'Exam Planner',
          description: 'Keep track of all your upcoming midsems and compre exams.',
          side: "top", align: 'start'
        }
      }
    );
  }
  else if (pathname.startsWith('/dashboard/classes')) {
    steps.push(
      {
        element: '#tour-timeline',
        popover: {
          title: 'Daily Timeline',
          description: 'See your daily schedule in a chronological timeline view.',
          side: "top", align: 'start'
        }
      }
    );
  }
  
  // If we are on a page with no specific steps, just show the navbar steps
  if (steps.length === 0) {
    steps.push(...navbarSteps);
  }

  return steps;
}

export function startTour(pathname: string, theme: string = 'light') {
  let driverObj: any = null;

  const steps = getTourSteps(pathname, () => driverObj);
  
  if (steps.length === 0) return;

  driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    showButtons: ['next', 'previous', 'close'],
    popoverClass: theme === 'dark' ? 'driver-theme-dark' : 'driver-theme-light',
    steps: steps,
  });

  driverObj.drive();
}
